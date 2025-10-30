import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { Course, TimeSlot, CourseModel, TimetableDay } from './models';
import type { CourseView } from './courseView';
import { DayWeek, parseDayWeek, dayWeekToTimetableDay } from './models/dayWeek';
import { parseTime, buildDayStarts, parseMinutes } from '../utils/timetableTime';

export class TimetableSlotView {
  readonly course: Course;
  readonly timeSlot: TimeSlot;
  readonly day: DayWeek;
  readonly start: number;
  readonly end: number;

  constructor(course: Course, timeSlot: TimeSlot) {
    this.course = course;
    this.timeSlot = timeSlot;
    this.day = parseDayWeek(timeSlot.day);
    this.start = timeSlot.startBlock;
    this.end = this.start + course.durationBlocks;
  }

  StartDate(dayStarts: Dayjs[], blockMinutes: number): Date {
    const instant = dayStarts[this.day].add((this.start - 1) * blockMinutes, 'minute');
    return instant.toDate();
  }

  EndDate(dayStarts: Dayjs[], blockMinutes: number): Date {
    const dayStart = dayStarts[this.day];
    const instant = dayStart.add((this.end - 1) * blockMinutes, 'minute');
    const endOfDay = dayStart.endOf('day');
    const clamped = instant.isAfter(endOfDay) ? endOfDay : instant;
    return clamped.toDate();
  }

  static parseTime(value: Date | string | Dayjs, model: CourseModel, course: CourseView): TimetableSlotView | null {
    if (!course) return null;

    const instant = dayjs.isDayjs(value) ? value : dayjs(value);
    if (!instant.isValid()) return null;

    const blockMinutes = parseMinutes(model.blockDuration);
    const startTime = parseTime(model.startTime);
    const weekStart = dayjs().startOf('week');
    const dayStarts = buildDayStarts(model, weekStart, startTime);
    const column = dayStarts.findIndex((anchor) => instant.isSame(anchor, 'day'));
    if (column < 0) return null;

    const minutes = instant.diff(dayStarts[column], 'minute');
    const startBlock = Math.floor(minutes / blockMinutes) + 1;
    if (!TimetableSlotView.withinBounds(startBlock, course.durationBlocks, model.blocks)) return null;

    const day = TimetableSlotView.toTimetableDay(instant);
    return new TimetableSlotView(course.toCourse(), { day, startBlock });
  }

  private static toTimetableDay(value: Dayjs): TimetableDay {
    const dayNumber = ((value.day() + 6) % 7) as DayWeek;
    return dayWeekToTimetableDay(dayNumber);
  }

  private static withinBounds(startBlock: number, span: number, totalBlocks: number): boolean {
    return startBlock >= 1 && startBlock <= totalBlocks - (span - 1);
  }

  overlaps(other: TimetableSlotView): boolean {
    return this.day === other.day && this.start < other.end && other.start < this.end;
  }

  key(): string {
    return `${this.day}-${this.start}`;
  }
}
