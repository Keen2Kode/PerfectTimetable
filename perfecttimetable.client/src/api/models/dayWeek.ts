import type { TimetableDay } from './timetableDay';

export enum DayWeek {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export function parseDayWeek(value: TimetableDay | string): DayWeek {
  const key = value as keyof typeof DayWeek;
  const numeric = DayWeek[key];
  if (typeof numeric === 'number') {
    return numeric;
  }

  throw new Error(`Invalid day: ${value}`);
}

export function dayWeekToTimetableDay(day: DayWeek): TimetableDay {
  return DayWeek[day] as TimetableDay;
}
