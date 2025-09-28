import type { KeyboardEvent } from 'react';
import type { TimeSlot } from '../api/models';
import './CourseTimetable.css';

interface CourseTimetableProps {
    courseId: number;
    friendlyDays: string[];
    dayValues: number[];
    timeLabels: string[];
    selectedSlots: TimeSlot[];
    onToggleSlot: (day: number, startBlock: number) => void;
}

export function CourseTimetable({ courseId, friendlyDays, dayValues, timeLabels, selectedSlots, onToggleSlot }: CourseTimetableProps) {
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
                            {friendlyDays.map((_, columnIndex) => {
                                const dayValue = dayValues[columnIndex];
                                const startBlock = rowIndex + 1;
                                const isSelected = selectedSlots.some(
                                    (slot) => slot.day === dayValue && slot.startBlock === startBlock,
                                );
                                const cellKey = `${courseId}-cell-${rowIndex}-${columnIndex}`;

                                return (
                                    <td
                                        key={cellKey}
                                        className={`course-timetable__cell${isSelected ? ' course-timetable__cell--selected' : ''}`}
                                        onClick={() => onToggleSlot(dayValue, startBlock)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event: KeyboardEvent<HTMLTableCellElement>) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onToggleSlot(dayValue, startBlock);
                                            }
                                        }}
                                        aria-pressed={isSelected}
                                        aria-label={`Toggle block ${startBlock} on ${friendlyDays[columnIndex]}`}
                                    />
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
