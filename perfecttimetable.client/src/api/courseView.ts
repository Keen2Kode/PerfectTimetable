

export class CourseView {
    readonly id: number;
    readonly name: string;
    readonly durationBlocks: number;
    private slots: TimetableSlot[];

    constructor(course: Course) {
        this.id = course.id;
        this.name = course.name;
        this.durationBlocks = course.durationBlocks;
        this.slots = course.timeslots.map((slot) => new TimetableSlot(course, slot));
    }

    getSlots(): TimetableSlot[] {
        return this.slots;
    }

    setSlots(slots: TimetableSlot[]): void {
        this.slots = slots;
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
