import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { type Course, type TimeSlot, type CourseModel } from './models';
import { DayWeek, parseDayWeek, dayWeekToTimetableDay } from './models/dayWeek';
import { parseTime, buildDayStarts, parseMinutes } from '../utils/timetableTime';

export class TimetableSlotView {
  public readonly course: Course;
  public readonly timeSlot: TimeSlot;
  public readonly day: DayWeek;
  public readonly start: number;
  public readonly end: number;

  constructor(course: Course, timeSlot: TimeSlot) {
    this.course = course;
    this.timeSlot = timeSlot;
      this.day = parseDayWeek(timeSlot.day);
    this.start = timeSlot.startBlock;
      this.end = this.start + course.durationBlocks;

    }

    // TODO: modify base code to handle these indexing issues.
    StartDate(dayStarts: Dayjs[], blockMinutes: number): Date {
        const dayjs = dayStarts[this.day].add((this.start-1) * blockMinutes, 'minute');
        return dayjs.toDate();
    }

    EndDate(dayStarts: Dayjs[], blockMinutes: number): Date {
        const dayjs = dayStarts[this.day].add((this.end - 1) * blockMinutes, 'minute');
        return dayjs.toDate();
    }

    static parseTime(
        value: Date | string | Dayjs,
        model: CourseModel,
        course: Course
    ): TimetableSlotView | null {

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
        if (!TimetableSlotView.withinBounds(startBlock, course.durationBlocks, model.blocks)) return null;

        const day = TimetableSlotView.toTimetableDay(instant);
        return new TimetableSlotView(course, {day, startBlock});
    }

    private static toTimetableDay(value: Dayjs) {
        const dayNumber = ((value.day() + 6) % 7) as DayWeek;
        return dayWeekToTimetableDay(dayNumber);
    }

    private static withinBounds(startBlock: number, span: number, totalBlocks: number) {
        return startBlock >= 1 && startBlock <= totalBlocks - (span - 1);
    }


  overlaps(other: TimetableSlotView): boolean {
    return this.day === other.day && this.start < other.end && other.start < this.end;
  }


    key(): string {
        return `${this.day}-${this.start}`;
    }
}

