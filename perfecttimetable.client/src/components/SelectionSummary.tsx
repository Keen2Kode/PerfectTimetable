import { DayWeek } from '../api/models/dayWeek';
import type { TimetableSlotView } from '../api/timetableSlot';

interface SelectionSummaryProps {
    courseName: string;
    selections: TimetableSlotView[];
}

export function SelectionSummary({ courseName, selections }: SelectionSummaryProps) {
    if (selections.length === 0) {
        return (
            <div className="timetable__selection-empty" aria-live="polite">
                <p>Select a cell to add a new timeslot for {courseName}.</p>
            </div>
        );
    }

    return (
        <div className="timetable__selection-summary" aria-live="polite">
            <h3 className="timetable__selection-title">Selected timeslots</h3>
            <ul className="timetable__selection-list">
                {selections.map((slot, index) => (
                    <li key={`${slot.day}-${slot.start}-${index}`}>
                        <span className="timetable__selection-day">{DayWeek[slot.day]}</span>
                        <span className="timetable__selection-block">Block {slot.start}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SelectionSummary;
