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

  key(): string {
    return `${this.day}-${this.startBlock}`;
  }

  toRange(
    repeatBlocks: number,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
  ): { start: Date; end: Date } | null {
    const span = Math.max(1, repeatBlocks);
    const column = model.days.indexOf(this.day);
    if (column < 0) return null;

    const start = dayStarts[column].add((this.startBlock - 1) * blockMinutes, 'minute');
    return {
      start: start.toDate(),
      end: start.add(span * blockMinutes, 'minute').toDate(),
    };
  }

  static parseTime(
    value: Date | string | Dayjs,
    model: CourseModel,
    dayStarts: Dayjs[],
    blockMinutes: number,
    repeatBlocks = 1,
  ): Slot | null {
    const span = Math.max(1, repeatBlocks);
    const instant = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!instant.isValid()) return null;

    const column = dayStarts.findIndex((anchor) => instant.isSame(anchor, 'day'));
    if (column < 0) return null;

    const minutes = instant.diff(dayStarts[column], 'minute');
    const startBlock = Math.floor(minutes / blockMinutes) + 1;
    if (!Slot.withinBounds(startBlock, span, model.blocks)) return null;

    return new Slot(model.days[column], startBlock);
  }

  private static withinBounds(startBlock: number, span: number, totalBlocks: number) {
    return startBlock >= 1 && startBlock <= totalBlocks - (span - 1);
  }

  equals(other: Slot | TimeSlot | null | undefined): boolean {
    if (!other) return false;
    const compare = other instanceof Slot ? other : Slot.fromTimeSlot(other);
    return this.day === compare.day && this.startBlock === compare.startBlock;
  }
}
