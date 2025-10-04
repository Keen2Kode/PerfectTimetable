import type { CourseModel, Timetable as ApiTimetable, TimetableSlot as ApiTimetableSlot } from './models';
import { TimetableSlot } from './timetableSlot';
import { CourseView } from './courseView';

export class ModelView {
    readonly startTime: string;
    readonly blockDuration: string;
    readonly blocks: number;
    readonly days: CourseModel['days'];
    readonly courses: CourseView[];

    constructor(source: CourseModel) {
        this.startTime = source.startTime;
        this.blockDuration = source.blockDuration;
        this.blocks = source.blocks;
        this.days = source.days;
        this.courses = source.courses.map((course) => new CourseView(course));
    }

    getCourses(): CourseView[] {
        return this.courses;
    }

    getCourse(id: number): CourseView | undefined {
        return this.courses.find((course) => course.id === id);
    }

    withUpdatedCourse(courseId: number, slots: TimetableSlot[]): ModelView {
        const clone = new ModelView(this.toCourseModel());
        clone.updateCourseSlots(courseId, slots);
        return clone;
    }

    updateCourseSlots(courseId: number, slots: TimetableSlot[]): void {
        this.getCourse(courseId)?.setSlots(slots);
    }

    toCourseModel(): CourseModel {
        return {
            startTime: this.startTime,
            blockDuration: this.blockDuration,
            blocks: this.blocks,
            days: this.days,
            courses: this.courses.map((course) => course.toCourse()),
        };
    }

    static fromApiTimetables(timetables: ApiTimetable[]): TimetableSlot[][] {
        return timetables
            .map((timetable) => timetable.slots?.map(ModelView.toSlot) ?? [])
            .filter((slots) => slots.length > 0);
    }

    private static toSlot(slot: ApiTimetableSlot): TimetableSlot {
        return new TimetableSlot(slot.course, slot.timeSlot);
    }
}
