import type { TimetableDay } from '../api/models';
import type { Course } from '../api/models/course';
import './CourseCard.css';

interface CourseCardProps {
    course: Course;
    friendlyDays: TimetableDay[];
    accentColour: string;
    accentSurface: string;
}

export function CourseCard({ course, accentColour, accentSurface }: CourseCardProps) {
    return (
        <section
            className="course-card"
            style={{
                borderColor: accentColour,
                backgroundColor: accentSurface,
            }}
        >
            <header className="course-card__header">
                <h2 className="course-card__title">{course.name}</h2>
                <p className="course-card__meta">
                    {course.durationBlocks} blocks duration
                </p>
            </header>

            <ul className="course-card__timeslots">
                {course.timeslots.map((slot, index) => {
                    const dayLabel = slot.day;

                    return (
                        <li key={`${course.id}-${index}`} className="course-card__timeslot">
                            <span className="course-card__day">{dayLabel.toString()}</span>
                            <span className="course-card__block">Starts at block {slot.startBlock}</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
