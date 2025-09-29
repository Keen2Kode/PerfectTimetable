// perfecttimetable.client/src/models/slot.ts
import type { TimetableDay, TimeSlot } from '../api/models';

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

  equals(other: Slot | TimeSlot | null | undefined): boolean {
    if (!other) return false;
    const compare = other instanceof Slot ? other : Slot.fromTimeSlot(other);
    return this.day === compare.day && this.startBlock === compare.startBlock;
  }
}
