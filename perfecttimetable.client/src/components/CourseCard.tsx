import { useState, type Dispatch, type SetStateAction, type CSSProperties } from 'react';
import Slider from '@mui/material/Slider';
import './SliderStyles.css';
import './CourseCard.scss';
import { ModelView} from '../api/modelView';
import type { CourseView } from '../api/courseView';
import SingleCourseTimetable from './SingleCourseTimetable';
import { MinusIcon, PlusIcon, TrashIcon } from './icons/LucideIcons';

interface CourseCardProps {
    courseView: CourseView;
    modelView: ModelView;
    setView: Dispatch<SetStateAction<ModelView | null>>;
}

interface AddCourseCardProps {
    setView: Dispatch<SetStateAction<ModelView | null>>;
    nextColour: string;
}

export function CourseCard({ courseView, modelView, setView}: CourseCardProps) {
    const course = courseView.toCourse();
    const currentDuration =  modelView.getCourse(course.id)?.durationBlocks ?? course.durationBlocks;
    const [isCollapsed, setCollapsed] = useState(false);
    const actionIconClass = 'course-card__icon course-card__icon--button';
    const baseColour = modelView.colours.getColour(course.id);

    return (
        <section
            className="course-card"
            style={{
                '--course-card-base': baseColour,
            } as CSSProperties}
        >
            <header className="course-card__header">
                <div className="course-card__title-row">
                    <h2 className="course-card__title">{course.name}</h2>
                    <div className="course-card__actions">
                        <button
                            type="button"
                            className="course-card__action course-card__minimize"
                            onClick={() => setCollapsed((previous) => !previous)}
                            title={isCollapsed ? 'Expand' : 'Minimize'}
                        >
                            {isCollapsed
                                ? <PlusIcon aria-hidden className={actionIconClass} />
                                : <MinusIcon aria-hidden className={actionIconClass} />}
                        </button>
                        <div className="course-card__actions-divider" aria-hidden="true" />
                        <button
                            type="button"
                            className="course-card__action course-card__remove"
                            onClick={() => setView((previous) => previous?.withCourseRemoved(course.id) ?? null)}
                            title="Remove"
                        >
                            <TrashIcon aria-hidden className={actionIconClass} />
                        </button>
                    </div>
                </div>
                {!isCollapsed && BlockSizeSlider()}
            </header>

            {!isCollapsed && (
                <SingleCourseTimetable
                    modelView={modelView}
                    courseView={courseView}
                    setView={setView}
                />
            )}

        </section>
    );

    function BlockSizeSlider() {
        return (
            <div className="course-card__meta">
                <Slider
                    className="app-slider"
                    min={1}
                    max={6}
                    step={1}
                    value={currentDuration}
                    onChange={(_, value) => {
                        setView((previous) => previous?.withCourseDurationUpdated(course.id, value) ?? null);
                    }}
                    aria-label="Course duration in blocks"
                />
                <span>{currentDuration} blocks duration</span>
            </div>
        );
    }
}

export function AddCourseCard({ setView, nextColour }: AddCourseCardProps) {
    const addCardStyle = {
        '--course-card-base': nextColour,
    } as CSSProperties;

    return (
        <button
            type="button"
            className="course-card course-card--add course-card--interactive"
            onClick={() => setView((previous) => previous?.withCourseAdded() ?? null)}
            style={addCardStyle}
        >
            <PlusIcon aria-hidden className="course-card__icon course-card__icon--add" />
        </button>
    );
}
