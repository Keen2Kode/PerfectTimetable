import dayjs, { type Dayjs } from 'dayjs';
import type { CourseModel, TimetableDay, TimeSlot } from '../api/models';

export class Slot {
  constructor(
    public readonly day: TimetableDay,
    public readonly startBlock: number,
  ) {}

  static fromTimeSlot(slot: TimeSlot): Slot {
    return new Slot(slot.day, slot.startBlock);
    }


  toTimeSlot(): TimeSlot {
    return { day: this.day, startBlock: this.startBlock };
  }





  toRange(
    repeatBlocks: number,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
  ): { start: Date; end: Date } | null {
    const column = model.days.indexOf(this.day);
    if (column < 0) return null;

    const start = dayStarts[column].add((this.startBlock - 1) * blockMinutes, 'minute');
    return {
      start: start.toDate(),
      end: start.add(repeatBlocks * blockMinutes, 'minute').toDate(),
    };
  }

  static parseTime(
    value: Date | string | Dayjs,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
  ): Slot | null {
    const instant = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!instant.isValid()) return null;

    const column = dayStarts.findIndex((anchor) => instant.isSame(anchor, 'day'));
    if (column < 0) return null;

    const minutes = instant.diff(dayStarts[column], 'minute');
    const startBlock = Math.floor(minutes / blockMinutes) + 1;
    if (startBlock < 1 || startBlock > model.blocks) return null;

    return new Slot(model.days[column], startBlock);
  }

  equals(other: Slot | TimeSlot | null | undefined): boolean {
    if (!other) return false;
    const compare = other instanceof Slot ? other : Slot.fromTimeSlot(other);
    return this.day === compare.day && this.startBlock === compare.startBlock;
  }
}

