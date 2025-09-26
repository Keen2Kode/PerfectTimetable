import * as React from 'react';
import type { Course } from './TimetableApp';
import './CourseCard.css';

interface CourseCardProps {
    course: Course;
    friendlyDays: string[];
}

export function CourseCard({ course, friendlyDays }: CourseCardProps) {
    return (
        <section className="course-card">
            <header className="course-card__header">
                <h2 className="course-card__title">{course.name}</h2>
                <p className="course-card__meta">
                    {course.durationBlocks} blocks duration
                </p>
            </header>

            <ul className="course-card__timeslots">
                {course.timeslots.map((slot, index) => {
                    const dayLabel = friendlyDays[slot.day] ?? `Day ${slot.day}`;

                    return (
                        <li key={`${course.id}-${index}`} className="course-card__timeslot">
                            <span className="course-card__day">{dayLabel}</span>
                            <span className="course-card__block">Starts at block {slot.startBlock}</span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
