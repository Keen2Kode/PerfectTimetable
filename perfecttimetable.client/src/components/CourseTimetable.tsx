import { Calendar, Views, dayjsLocalizer, type SlotInfo, type View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

import { TimetableDay } from "../api/models";
import type { CourseModel, TimeSlot } from "../api/models";
import { anchor, buildDayStarts, parseMinutes, parseTime } from "../utils/timetableTime";
import "./CourseTimetable.css";

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



export function CourseTimetable({ model, selectedSlots, onSelectionChange, blockLength }: CourseTimetableProps) {
    const blockDurationMinutes = parseMinutes(model.blockDuration);
    const startTime = parseTime(model.startTime);
    const weekStart = dayjs().startOf("week");
    const dayStarts = buildDayStarts(model, weekStart, startTime);
    const view: View =
        model.days.every((day) => day !== TimetableDay.Saturday && day !== TimetableDay.Sunday)
            ? Views.WORK_WEEK
            : Views.WEEK;

    const anchorDate = anchor(startTime);
    const min = anchorDate.toDate();
    const max = anchorDate.add(blockDurationMinutes * model.blocks, "minute").toDate();

    const events = selectedSlots
        .map<SlotEvent | null>((slot) => {
            const dayIndex = model.days.indexOf(slot.day);
            if (dayIndex < 0) return null;
            const start = dayStarts[dayIndex].add((slot.startBlock - 1) * blockDurationMinutes, "minute");
            return {
                ...slot,
                start: start.toDate(),
                end: start.add(blockDurationMinutes, "minute").toDate(),
            };
        })
        .filter((event): event is SlotEvent => Boolean(event));





    function handleSelection(payload: SlotInfo | SlotEvent) {
            const baseSlot = toSlot(payload.start);
            if (!baseSlot) return;
            const expanded = expandSlots(baseSlot, blockLength, model.blocks);
            onSelectionChange(toggle(selectedSlots, expanded));
    }

    const toSlot = (date: Date): TimeSlot | null => {
        const value = dayjs(date);
        const dayIndex = dayStarts.findIndex((start) => value.isSame(start, "day"));
        if (dayIndex < 0) return null;

        const minutes = value.diff(dayStarts[dayIndex], "minute");
        const startBlock = Math.floor(minutes / blockDurationMinutes) + 1;
        if (startBlock < 1 || startBlock > model.blocks) return null;

        return { day: model.days[dayIndex], startBlock };
    };

    const expandSlots = (slot: TimeSlot, blockLength: number, maxBlocks: number): TimeSlot[] => {
        const blocks: TimeSlot[] = [];
        for (let i = 0; i < blockLength; i += 1) {
            const startBlock = slot.startBlock + i;
            if (startBlock > maxBlocks) break;
            blocks.push({ day: slot.day, startBlock });
        }
        return blocks;
    };

    return (
        <div className="course-timetable">
            <Calendar<SlotEvent>
                localizer={localizer}
                defaultDate={min}
                defaultView={view}
                views={[view]}
                toolbar={false}
                selectable
                events={events}
                step={blockDurationMinutes}
                timeslots={1}
                min={min}
                max={max}
                onSelectSlot={handleSelection}
                onSelectEvent={handleSelection}
                eventPropGetter={() => ({ className: "course-timetable__selection" })}
                longPressThreshold={1}
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
