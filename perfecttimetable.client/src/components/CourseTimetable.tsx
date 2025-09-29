import type { ComponentType, ReactNode } from 'react';
import { Calendar, Views, dayjsLocalizer, type SlotInfo, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

import { TimetableDay } from '../api/models';
import type { CourseModel, TimeSlot } from '../api/models';
import { anchor, buildDayStarts, parseMinutes, parseTime } from '../utils/timetableTime';
import { rangeToSlot, slotToRange } from '../utils/slotTime';
import './CourseTimetable.css';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);

const localizer = dayjsLocalizer(dayjs);

interface CourseTimetableProps {
    model: CourseModel;
    selectedSlots: TimeSlot[];
    onSelectionChange: (slots: TimeSlot[]) => void;
    blockLength: number;
}

type SlotEvent = TimeSlot & { start: Date; end: Date };
type SelectionPayload = SlotInfo | SlotEvent;


export function CourseTimetable({ model, selectedSlots, onSelectionChange, blockLength }: CourseTimetableProps) {
    const slotBlockLength = Math.max(1, blockLength);
    const blockLengthMinutes = parseMinutes(model.blockDuration);
    const startTime = parseTime(model.startTime);
    const weekStart = dayjs().startOf('week');
    const dayStarts = buildDayStarts(model, weekStart, startTime);
    const view: View =
        model.days.every((day) => day !== TimetableDay.Saturday && day !== TimetableDay.Sunday)
            ? Views.WORK_WEEK
            : Views.WEEK;

    const anchorDate = anchor(startTime);
    const min = anchorDate.toDate();
    const max = anchorDate.add(blockLengthMinutes * model.blocks, 'minute').toDate();

    const boundedStart = (slot: TimeSlot) => slot.startBlock <= model.blocks - (slotBlockLength - 1);

    const events = selectedSlots
        .map((slot) => {
            const range = slotToRange(slot, slotBlockLength, model, dayStarts, blockLengthMinutes);
            return range ? { ...slot, ...range } : null;
        })
        .filter((event): event is SlotEvent => Boolean(event));

    const toSlot = (date: Date): TimeSlot | null => rangeToSlot(date, model, dayStarts, blockLengthMinutes);

    const handleSelection = (payload: SelectionPayload) => {
        const baseSlot = toSlot(payload.start);
        if (!baseSlot || !boundedStart(baseSlot)) return;
        //const expanded = expandSlots(baseSlot, slotBlockLength, model.blocks);
        onSelectionChange(toggle(selectedSlots, [baseSlot]));
    };

    //const handleSelecting = ({ start }: { start: Date; end: Date }) => {
    //    const slot = toSlot(start);
    //    return !slot || boundedStart(slot);
    //};

    const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
        const slot = toSlot(value);
        const disabled = slot ? !boundedStart(slot) : false;
        return (
            <div
                className={disabled ? 'course-timetable__slot--disabled' : undefined}
                style={disabled ? { pointerEvents: 'none' } : undefined}
            >
                {children}
            </div>
        );
    };

    return (
        <div className='course-timetable'>
            <Calendar<SlotEvent>
                localizer={localizer}
                defaultDate={min}
                defaultView={view}
                views={[view]}
                toolbar={false}
                selectable
                events={events}
                step={blockLengthMinutes}
                timeslots={1}
                min={min}
                max={max}
                onSelectSlot={handleSelection}
                onSelectEvent={handleSelection}
                //onSelecting={handleSelecting}
                eventPropGetter={() => ({ className: 'course-timetable__selection' })}
                components={{ timeSlotWrapper: slotWrapper as ComponentType }}
                longPressThreshold={1}
                dayLayoutAlgorithm="no-overlap"
            />
        </div>
    );
}

const toggle = (current: TimeSlot[], toggled: TimeSlot[]) => {
    const map = new Map(current.map((slot) => [key(slot), slot]));
    for (const slot of toggled) {
        const id = key(slot);
        if (map.has(id)) map.delete(id);
        else map.set(id, slot);
    }
    return [...map.values()];
};

const key = (slot: TimeSlot) => `${slot.day}-${slot.startBlock}`;
