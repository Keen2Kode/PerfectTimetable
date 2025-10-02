import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { type TimetableSlot as TimetableSlotDto, type Course, type TimeSlot, type CourseModel } from './models';
import { DayWeek, parseDayWeek, dayWeekToTimetableDay } from './models/dayWeek';
import { Slot } from './slot';
import { parseTime, buildDayStarts, parseMinutes } from '../utils/timetableTime';

export class TimetableSlot {
  public readonly course: Course;
  public readonly timeSlot: TimeSlot;
  public readonly day: DayWeek;
  public readonly start: number;
  public readonly end: number;
    public readonly baseSlot: Slot;

  constructor(course: Course, timeSlot: TimeSlot) {
    this.course = course;
    this.timeSlot = timeSlot;
    this.baseSlot = Slot.fromTimeSlot(timeSlot);
      this.day = parseDayWeek(this.baseSlot.day);
    this.start = this.baseSlot.startBlock;
      this.end = this.start + course.durationBlocks;

    }

    //toSlot(): Slot {
    //    const day: string = this.day.toString()
    //    const start = this.start;
    //    return { day, start };
    //}

    // TODO: not sure if -1 is necessary.
    StartDate(dayStarts: Dayjs[], blockMinutes: number): Date {
        const dayjs = dayStarts[this.day].add((this.start-1) * blockMinutes, 'minute');
        return dayjs.toDate();
    }

    EndDate(dayStarts: Dayjs[], blockMinutes: number): Date {
        const dayjs = dayStarts[this.day].add((this.end - 1) * blockMinutes, 'minute');
        return dayjs.toDate();
    }

    // TODO: verify logic
    static parseTime(
        value: Date | string | Dayjs,
        model: CourseModel,
        course: Course
    ): TimetableSlot | null {

        if (course == null)
            return null;
        const instant = dayjs.isDayjs(value) ? value : dayjs(value);
        if (!instant.isValid()) return null;


        const blockMinutes = parseMinutes(model.blockDuration);

        // TODO: startTime, weekStart and dayStarts are fragile
        // as it is instantiated in other places.
        const startTime = parseTime(model.startTime);

        const weekStart = dayjs().startOf('week');
        const dayStarts = buildDayStarts(model, weekStart, startTime);
        const column = dayStarts.findIndex((anchor) => instant.isSame(anchor, 'day'));
        if (column < 0) return null;


        const minutes = instant.diff(dayStarts[column], 'minute');
        const startBlock = Math.floor(minutes / blockMinutes) + 1;
        if (!TimetableSlot.withinBounds(startBlock, course.durationBlocks, model.blocks)) return null;

        const day = TimetableSlot.toTimetableDay(instant);
        return new TimetableSlot(course, {day, startBlock});
    }

    private static toTimetableDay(value: Dayjs) {
        const dayNumber = ((value.day() + 6) % 7) as DayWeek;
        return dayWeekToTimetableDay(dayNumber);
    }

    private static withinBounds(startBlock: number, span: number, totalBlocks: number) {
        return startBlock >= 1 && startBlock <= totalBlocks - (span - 1);
    }

  static fromDto(dto: TimetableSlotDto): TimetableSlot {
    return new TimetableSlot(dto.course, dto.timeSlot);
  }

  static from(course: Course, timeSlot: TimeSlot): TimetableSlot {
    return new TimetableSlot(course, timeSlot);
  }

  toDto(): TimetableSlotDto {
    return {
      course: this.course,
      timeSlot: this.timeSlot,
    };
  }

  overlaps(other: TimetableSlot): boolean {
    return this.day === other.day && this.start < other.end && other.start < this.end;
  }

  equals(other: TimetableSlot | TimetableSlotDto | null | undefined): boolean {
    if (!other) return false;
    const candidate = other instanceof TimetableSlot ? other : TimetableSlot.fromDto(other);
    return (
      this.course.id === candidate.course.id &&
      this.day === candidate.day &&
      this.start === candidate.start
    );
    }

    key(): string {
        return `${this.day}-${this.start}`;
    }
}

