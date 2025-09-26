import * as React from 'react';
import './CourseTimetable.css';

interface CourseTimetableProps {
    courseId: number;
    friendlyDays: string[];
    timeLabels: string[];
}

export function CourseTimetable({ courseId, friendlyDays, timeLabels }: CourseTimetableProps) {
    return (
        <div className="course-timetable">
            <table className="course-timetable__table">
                <thead>
                    <tr>
                        <th scope="col" className="course-timetable__time-column">
                            Time
                        </th>
                        {friendlyDays.map((day, index) => (
                            <th scope="col" key={`${courseId}-day-${index}`}>
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeLabels.map((label, rowIndex) => (
                        <tr key={`${courseId}-row-${rowIndex}`}>
                            <th scope="row" className="course-timetable__time-column">
                                {label}
                            </th>
                            {friendlyDays.map((_, columnIndex) => (
                                <td key={`${courseId}-cell-${rowIndex}-${columnIndex}`}>
                                    {/* Content to be added later */}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
