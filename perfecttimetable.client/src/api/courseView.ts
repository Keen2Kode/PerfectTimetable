import type { Course } from './models';
import { TimetableSlotView } from './timetableSlot';

export class CourseView {
    readonly id: number;
    readonly name: string;
    readonly durationBlocks: number;
    private slots: TimetableSlotView[];

    constructor(course: Course) {
        this.id = course.id;
        this.name = course.name;
        this.durationBlocks = course.durationBlocks;
        this.slots = course.timeslots.map((slot) => new TimetableSlotView(course, slot));
    }

    getSlots(): TimetableSlotView[] {
        return this.slots;
    }

    setSlots(slots: TimetableSlotView[]) {
        this.slots = slots;
        return this.slots;
    }

    toggleSlots(toggled: TimetableSlotView[]) {
        const current = new Map(this.slots.map((slot) => [slot.key(), slot]));
        for (const slot of toggled) {
            const key = slot.key();
            if (current.has(key)) { current.delete(key); } else { current.set(key, slot); }
        }
        this.slots = [...current.values()];
        return this.slots;
    }


    toCourse(): Course {
        return {
            id: this.id,
            name: this.name,
            durationBlocks: this.durationBlocks,
            timeslots: this.slots.map((slot) => slot.timeSlot),
        };
    }
}
