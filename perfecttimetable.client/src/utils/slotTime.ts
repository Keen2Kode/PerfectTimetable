import dayjs, { type Dayjs } from 'dayjs';
import type { CourseModel, TimeSlot } from '../api/models';

export const slotToRange = (
    slot: TimeSlot,
    repeatBlocks: number,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
): { start: Date; end: Date } | null => {
    const column = model.days.indexOf(slot.day);
    if (column < 0) return null;

    const start = dayStarts[column].add((slot.startBlock - 1) * blockMinutes, 'minute');
    return {
        start: start.toDate(),
        end: start.add(repeatBlocks * blockMinutes, 'minute').toDate(),
    };
};

export const rangeToSlot = (
    start: Date,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
): TimeSlot | null => {
    const value = dayjs(start);
    const column = dayStarts.findIndex((anchor) => value.isSame(anchor, 'day'));
    if (column < 0) return null;

    const minutes = value.diff(dayStarts[column], 'minute');
    const startBlock = Math.floor(minutes / blockMinutes) + 1;
    if (startBlock < 1 || startBlock > model.blocks) return null;

    return { day: model.days[column], startBlock };
};

