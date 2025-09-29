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
import { Slot } from '../api/slot';
import type { CourseModel } from '../api/models';
import { anchor, buildDayStarts, parseMinutes, parseTime } from '../utils/timetableTime';
import './CourseTimetable.css';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);

const localizer = dayjsLocalizer(dayjs);

interface CourseTimetableProps {
    model: CourseModel;
    selectedSlots: Slot[];
    onSelectionChange: (slots: Slot[]) => void;
    blockLength: number;
}

type SlotEvent = { slot: Slot; start: Date; end: Date };

export function CourseTimetable({ model, selectedSlots, onSelectionChange, blockLength }: CourseTimetableProps) {
    const spanBlocks = Math.max(1, blockLength);
    const blockDuration = parseMinutes(model.blockDuration);
    const startTime = parseTime(model.startTime);
    const weekStart = dayjs().startOf('week');
    const dayStarts = buildDayStarts(model, weekStart, startTime);
    const view: View =
        model.days.every((day) => day !== TimetableDay.Saturday && day !== TimetableDay.Sunday)
            ? Views.WORK_WEEK
            : Views.WEEK;

    const anchorDate = anchor(startTime);
    const min = anchorDate.toDate();
    const max = anchorDate.add(blockDuration * model.blocks, 'minute').toDate();

    const events: SlotEvent[] = selectedSlots
        .map((slot) => {
            const range = slot.toRange(spanBlocks, model, dayStarts, blockDuration);
            return range ? { slot, ...range } : null;
        })
        .filter((event): event is SlotEvent => Boolean(event));


    const handleSelection = (payload: SlotInfo | SlotEvent) => {
        const baseSlot = Slot.parseTime(payload.start, model, dayStarts, blockDuration, spanBlocks);
        if (!baseSlot) return;
        onSelectionChange(toggle(selectedSlots, [baseSlot]));
    };

    const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
        const slot = Slot.parseTime(value, model, dayStarts, blockDuration, spanBlocks);
        const disabled = slot == null;
        return (
            <div
                className={disabled ? 'course-timetable__slot--disabled' : undefined}
                style={disabled ? { pointerEvents: 'none' } : undefined}
            >
                {children}
            </div>
        );
    };

    const components2 = {
        timeSlotWrapper: slotWrapper as ComponentType,
        allDay: () => null,
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
                step={blockDuration}
                timeslots={1}
                min={min}
                max={max}
                onSelectSlot={handleSelection}
                onSelectEvent={handleSelection}
                onSelecting={() => false}
                eventPropGetter={() => ({ className: 'course-timetable__selection' })}
                allDayAccessor={() => false}
                components={components2}
                dayLayoutAlgorithm="no-overlap"
                longPressThreshold={1}
            />
        </div>
    );
}

const toggle = (current: Slot[], toggled: Slot[]) => {
    const map = new Map(current.map((slot) => [slot.key(), slot]));
    for (const slot of toggled) {
        const id = slot.key();
        if (map.has(id)) map.delete(id);
        else map.set(id, slot);
    }
    return [...map.values()];
};
