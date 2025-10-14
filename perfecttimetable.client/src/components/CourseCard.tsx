import type { Dispatch, SetStateAction } from 'react';
import { produce } from 'immer';
import './CourseCard.css';
import { ModelView} from '../api/modelView';
import type { CourseView } from '../api/courseView';
import type { TimetableSlotView } from '../api/timetableSlot';
import SingleCourseTimetable from './SingleCourseTimetable';
import { TrashIcon } from './icons/LucideIcons';

interface CourseCardProps {
    courseView: CourseView;
    modelView: ModelView;
    setView: Dispatch<SetStateAction<ModelView | null>>;
}


export function CourseCard({ courseView, modelView, setView}: CourseCardProps) {
    const course = courseView.toCourse();
    const currentDuration =  modelView.getCourse(course.id)?.durationBlocks ?? course.durationBlocks;

    return (
        <section
            className="course-card"
            style={{
                borderColor: modelView.colours.getColour(course.id),
                backgroundColor: modelView.colours.getColourWithAlpha(course.id, 0.5),
            }}
        >
            <header className="course-card__header">
                <div className="course-card__title-row">
                    <h2 className="course-card__title">{course.name}</h2>
                    <button
                        type="button"
                        className="course-card__remove"
                        onClick={() => setView((previous) => previous?.withCourseRemoved(course.id) ?? null)}
                        aria-label={`Remove ${course.name}`}
                    >
                        <TrashIcon aria-hidden />
                    </button>
                </div>
                <div className="course-card__meta">
                    <input
                        type="range"
                        min={1}
                        max={6}
                        value={currentDuration}
                        onChange={(event) => {
                            const nextValue = Number(event.currentTarget.value);
                            setView((previous) => {
                                if (!previous) return previous;
                                const updated = produce(previous.toCourseModel(), (draft) => {
                                    const target = draft.courses.find((item) => item.id === course.id);
                                    if (target) {
                                        target.durationBlocks = nextValue;
                                    }
                                });
                                return new ModelView(updated);
                            });
                        }}
                        aria-label="Course duration in blocks"
                    />
                    <span>{currentDuration} blocks duration</span>
                </div>
            </header>

            <SingleCourseTimetable
                modelView={modelView}
                courseView={courseView}
                setView={setView}
            />

        </section>
    );
}
