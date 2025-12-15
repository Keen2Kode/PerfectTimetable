import { useMutation } from '@tanstack/react-query';
import { useRef, type ChangeEvent, type CSSProperties, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { ModelView } from '../api/modelView';
import { uploadCourseScreenshot } from '../api/timetableApi';
import { PlusIcon } from './icons/LucideIcons';
import type { Course } from '../api/models';

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

    const { mutateAsync: submitScreenshot, isPending } = useMutation<Course, Error, File>({
        mutationFn: async (file: File) => {
            return await uploadCourseScreenshot({
                ModelJson: JSON.stringify(modelView.toCourseModel()),
                Image: file
            })
        },
        onSuccess: (course: Course) => {
            toast.success('Uploaded screenshot for AI parsing.');
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
                onClick={() =>
                    setView((previous) => previous?.withCourseAdded() ?? modelView.withCourseAdded())}
                style={addCardStyle}
            >
                <PlusIcon aria-hidden className="course-card__icon course-card__icon--add" />
            </button>
            <button
                type="button"
                className="course-card course-card--add course-card--interactive"
                onClick={() => !isPending && fileInputRef.current?.click()}
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
