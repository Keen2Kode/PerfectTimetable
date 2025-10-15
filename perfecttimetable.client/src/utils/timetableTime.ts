import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { CourseModel, TimetableDay } from '../api/models';

dayjs.extend(customParseFormat);

const dayIndex: Record<TimetableDay, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
};

export const parseTime = (value: string): Dayjs => dayjs(value, 'HH:mm:ss', true);

export const parseMinutes = (value: string): number => {
    const parsed = dayjs(value, 'HH:mm:ss', true);
    return parsed.hour() * 60 + parsed.minute();
};

export const minutesToTimeString = (minutes: number): string =>
    dayjs().startOf('day').add(minutes, 'minute').format('HH:mm:ss');


export const buildDayStarts = (model: CourseModel, weekStart: Dayjs, startTime: Dayjs): Dayjs[] =>
    model.days.map((day) =>
        weekStart
            .day(dayIndex[day])
            .hour(startTime.hour())
            .minute(startTime.minute())
            .second(startTime.second())
            .millisecond(0),
    );

export const anchor = (startTime: Dayjs): Dayjs =>
    dayjs()
        .startOf('day')
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(startTime.second())
        .millisecond(0);

export function formatTime(value: string) {
    return dayjs(value, 'HH:mm:ss', true).format('hh:mm A');
}

export const formatMinutes = (minutes: number): string =>
    formatTime(minutesToTimeString(minutes));
