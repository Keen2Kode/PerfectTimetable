import type { TimeSlot } from '../api/models';

interface SelectionSummaryProps {
    courseName: string;
    selections: TimeSlot[];
    dayLabelLookup: Record<number, string>;
}

export function SelectionSummary({ courseName, selections, dayLabelLookup }: SelectionSummaryProps) {
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
                    <li key={`${slot.day}-${slot.startBlock}-${index}`}>
                        <span className="timetable__selection-day">{dayLabelLookup[slot.day]}`</span>
                        <span className="timetable__selection-block">Block {slot.startBlock}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SelectionSummary;
