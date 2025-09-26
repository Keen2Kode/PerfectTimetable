import * as React from 'react';
import type { Course } from './TimetableApp';
import './CourseCard.css';

interface CourseCardProps {
    course: Course;
    friendlyDays: string[];
}

export function CourseCard({ course, friendlyDays }: CourseCardProps) {
    return (
        <article className="course-card">
            <h2 className="course-card__title">{course.name}</h2>
            <p className="course-card__duration">
                {course.durationBlocks} blocks duration
            </p>
            <ul className="course-card__slots">
                {course.timeslots.map((slot, index) => {
                    const dayLabel = friendlyDays[slot.day] ?? `Day ${slot.day}`;

                    return (
                        <li key={`${course.id}-${index}`} className="course-card__slot">
                            <span className="course-card__day">{dayLabel}</span>
                            <span className="course-card__block">
                                Starts at Block {slot.startBlock}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </article>
    );
}
