import type { Course, CourseModel, Timetable as ApiTimetable, TimetableSlot as ApiTimetableSlot } from './models';
import { TimetableSlotView } from './timetableSlot';
import { CourseView } from './courseView';
import { CourseColours } from './courseColours';

export class ModelView {
    readonly maxCourses: CourseModel['maxCourses'];
    readonly maxSlots: CourseModel['maxSlots'];
    readonly startTime: string;
    readonly blockDuration: string;
    readonly blocks: number;
    readonly days: CourseModel['days'];
    readonly courses: CourseView[];
    readonly colours: CourseColours;

    constructor(source: CourseModel) {
        this.maxCourses = source.maxCourses;
        this.maxSlots = source.maxSlots;
        this.startTime = source.startTime;
        this.blockDuration = source.blockDuration;
        this.blocks = source.blocks;
        this.days = source.days;
        
        this.courses = source.courses.map((course) => new CourseView(course));
        this.colours = new CourseColours(this.courses);
       

    }

    getCourses(): CourseView[] {
        return this.courses;
    }

    getCourse(id: number): CourseView | undefined {
        return this.courses.find((course) => course.id === id);
    }

    withCourseAdded(course?: Course): ModelView {
        const model = this.toCourseModel();
        const courseToAdd =
            course ?? ModelView.createEmptyCourse(model.courses);

        return new ModelView({
            ...model,
            courses: [...model.courses, courseToAdd],
        });
    }

    withCourseRemoved(courseId: number): ModelView {
        const model = this.toCourseModel();
        return new ModelView({
            ...model,
            courses: model.courses.filter((course) => course.id !== courseId),
        });
    }



    withCourseDurationUpdated(courseId: number, durationBlocks: number): ModelView {
        const model = this.toCourseModel();
        const updatedCourses = model.courses.map((course) =>
            course.id === courseId ? { ...course, durationBlocks } : course,
        );
        return new ModelView({ ...model, courses: updatedCourses });
    }

    withCourseNameUpdated(courseId: number, name: string): ModelView {
        const trimmed = name.trim();
        if (!trimmed) {
            return this;
        }
        const namePattern = /^[A-Za-z0-9\s'-]*$/;
        if (!namePattern.test(trimmed)) {
            return this;
        }

        const model = this.toCourseModel();
        const updatedCourses = model.courses.map((course) =>
            course.id === courseId ? { ...course, name: trimmed } : course,
        );
        return new ModelView({ ...model, courses: updatedCourses });
    }

    withUpdatedSchedule(startTime: string, blockDuration: string, blocks: number): ModelView {
        const model = this.toCourseModel();
        return new ModelView({
            ...model,
            startTime,
            blockDuration,
            blocks,
        });
    }


    withUpdatedCourse(courseId: number, slots: TimetableSlotView[]): ModelView {
        const clone = new ModelView(this.toCourseModel());
        clone.updateCourseSlots(courseId, slots);
        return clone;
    }

    updateCourseSlots(courseId: number, slots: TimetableSlotView[]): void {
        this.getCourse(courseId)?.setSlots(slots);
    }

    toCourseModel(): CourseModel {
        return {
            maxCourses: this.maxCourses,
            maxSlots: this.maxSlots,
            startTime: this.startTime,
            blockDuration: this.blockDuration,
            blocks: this.blocks,
            days: this.days,
            courses: this.courses.map((course) => course.toCourse()),
        };
    }

    static fromApiTimetables(timetables: ApiTimetable[]): TimetableSlotView[][] {
        return timetables
            .map((timetable) => timetable.slots?.map(ModelView.toSlot) ?? [])
            .filter((slots) => slots.length > 0);
    }

    private static toSlot(slot: ApiTimetableSlot): TimetableSlotView {
        return new TimetableSlotView(slot.course, slot.timeSlot);
    }

    private static createEmptyCourse(existing: Course[]): Course {
        const nextId = existing.length > 0 ? Math.max(...existing.map((course) => course.id)) + 1 : 1;
        return {
            id: nextId,
            name: `New course ${nextId}`,
            durationBlocks: 1,
            timeslots: [],
        };
    }
}
