import type { KeyboardEvent } from 'react';
import type { CourseModel, TimeSlot, TimetableDay} from '../api/models';
import './CourseTimetable.css';
import dayjs from 'dayjs';

interface CourseTimetableProps {
    courseId: number;
    friendlyDays: TimetableDay[];
    //dayValues: number[];
    model: CourseModel;
    selectedSlots: TimeSlot[];
    onToggleSlot: (day: TimetableDay, startBlock: number) => void;
}

export function CourseTimetable({ courseId, friendlyDays,  model, selectedSlots, onToggleSlot }: CourseTimetableProps) {
    const timeLabels = createTimeLabels(model.startTime, model.blockDuration, model.blocks);
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
                            {friendlyDays.map((day,col) => {
                                const startBlock = rowIndex + 1;
                                const isSelected = selectedSlots.some(
                                    (slot) => slot.day === day && slot.startBlock === startBlock,
                                );
                                const cellKey = `${courseId}-cell-${rowIndex}-${col}`;

                                return (
                                    <td
                                        key={cellKey}
                                        className={`course-timetable__cell${isSelected ? ' course-timetable__cell--selected' : ''}`}
                                        onClick={() => onToggleSlot(day, startBlock)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event: KeyboardEvent<HTMLTableCellElement>) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                onToggleSlot(day, startBlock);
                                            }
                                        }}
                                        aria-pressed={isSelected}
                                        aria-label={`Toggle block ${startBlock} on ${friendlyDays[col]}`}
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

function createTimeLabels(startTime: string, blockDuration: string, blocks: number) {
    const start = dayjs(startTime, 'HH:mm:ss', true);
    const stepMinutes = duration(blockDuration);

    const labels: string[] = [];
    for (let i = 0; i < blocks; i++) {
        labels.push(start.add(stepMinutes * i, 'minute').format("hh:mm A"));
    }
    return labels;
}

function duration(value: string): number {
    const blockLength = dayjs(value, 'HH:mm:ss', true);
    const stepMinutes = blockLength.hour() * 60 + blockLength.minute();
    return stepMinutes;
}