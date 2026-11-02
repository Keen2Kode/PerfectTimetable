import { useMutation } from '@tanstack/react-query';
import { useRef, type ChangeEvent, type CSSProperties, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { ModelView } from '../api/modelView';
import { uploadCourseScreenshot } from '../api/timetableApi';
import { PlusIcon } from './icons/LucideIcons';
import type { AICourseResponseDto } from '../api/models';

interface CourseCardAddProps {
    modelView: ModelView;
    setView: Dispatch<SetStateAction<ModelView | null>>;
    nextColour: string;
}

export function CourseCardAdd({ modelView, setView, nextColour }: CourseCardAddProps) {
    const addCardStyle = {
        '--course-card-base': nextColour,
    } as CSSProperties;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const courseLimitReached = () => {
        if (modelView.getCourses().length < modelView.maxCourses) {
            return false;
        }

        toast.error(`You can add up to ${modelView.maxCourses} courses.`, {
            toastId: 'max-courses',
        });
        return true;
    };

    const { mutateAsync: submitScreenshot, isPending } = useMutation<AICourseResponseDto, Error, File>({
        mutationFn: async (file: File) => {
            return await uploadCourseScreenshot({
                ModelJson: JSON.stringify(modelView.toCourseModel()),
                Image: file
            })
        },
        onSuccess: ({ course, failedSlots }) => {
            if (courseLimitReached()) return;

            toast.success('Uploaded screenshot for AI parsing.');
            if (failedSlots.length > 0) {
                toast.warn(`${failedSlots.join('\n')}`);
            }
            setView((previous) => previous?.withCourseAdded(course) ?? previous);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (courseLimitReached()) {
            event.target.value = '';
            return;
        }

        try {
            await submitScreenshot(file);
        } catch {
            // Error toast handled in mutate onError.
        } finally {
            event.target.value = '';
        }
    };

    return (
        <div className="course-card__add-group">
            <button
                type="button"
                className="course-card course-card--add course-card--interactive"
                onClick={() => {
                    if (courseLimitReached()) return;

                    setView((previous) => previous?.withCourseAdded() ?? modelView.withCourseAdded());
                }}
                style={addCardStyle}
            >
                <PlusIcon aria-hidden className="course-card__icon course-card__icon--add" />
            </button>
            <button
                type="button"
                className="course-card course-card--add course-card--interactive"
                onClick={() => {
                    if (isPending || courseLimitReached()) return;

                    fileInputRef.current?.click();
                }}
                disabled={isPending}
                style={addCardStyle}
            >
                {isPending ? 'Uploading...' : 'AI upload screenshots'}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
}

export default CourseCardAdd;
