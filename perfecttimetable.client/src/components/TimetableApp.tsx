import * as React from 'react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { CourseTimetable } from './CourseTimetable';

dayjs.extend(customParseFormat);

type DayValue = number | string;

interface TimeSlot {
    day: number;
    startBlock: number;
}

export interface Course {
    id: number;
    name: string;
    durationBlocks: number;
    timeslots: TimeSlot[];
}

interface CourseModel {
    courses: Course[];
    days: DayValue[];
    startTime: string;
    blockDuration: string;
    blocks: number;
}

const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/**
 * Fetches the timetable data from the backend and renders a simple summary for
 * each course. This is intentionally lightweight so you can evolve it into the
 * full Perfect Timetable UI.
 */
export function TimetableApp() {
    const [model, setModel] = useState<CourseModel | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadTimetable();
    }, []);

    if (error) {
        return <p role="alert">Failed to load timetable: {error}</p>;
    }

    if (!model) {
        return <p>Loading timetable...</p>;
    }

    const friendlyDays = model.days.map((value) =>
        typeof value === 'string' ? value : dayNames[value] ?? `Day ${value}`
    );

    const timeLabels = createTimeLabels(
        model.startTime,
        model.blockDuration,
        model.blocks
    );

    return (
        <div className="timetable">
            <header>
                <h1>Perfect Timetable</h1>
                <p>
                    Starting {formatTime(model.startTime)},
                    {duration(model.blockDuration)}-minute blocks,
                    {model.blocks} blocks per day.
                </p>
            </header>

            <section className="timetable__grid">
                {model.courses.map((course) => (
                    <div key={course.id} className="timetable__course">
                        <CourseCard course={course} friendlyDays={friendlyDays} />
                        <CourseTimetable
                            courseId={course.id}
                            friendlyDays={friendlyDays}
                            timeLabels={timeLabels}
                        />
                    </div>
                ))}
            </section>
        </div>
    );

    async function loadTimetable() {
        try {
            const response = await fetch('/timetable');
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data: CourseModel = await response.json();
            setModel(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }
}

function formatTime(value: string) {
    return dayjs(value, 'HH:mm:ss', true).format("hh:mm A");
}

function duration(value: string): number {
    const blockLength = dayjs(value, 'HH:mm:ss', true);
    const stepMinutes = blockLength.hour() * 60 + blockLength.minute();
    return stepMinutes;
}

function createTimeLabels(startTime: string, blockDuration: string, blocks: number) {
    const start = dayjs(startTime, 'HH:mm:ss', true);
    const stepMinutes = duration(blockDuration);

    const labels: string[] = [];
    for (let i = 0; i < blocks; i++) {
        labels.push(start.add(stepMinutes * i, 'minute').format("hh:mm A"));
    }
    return labels;
}

export default TimetableApp;
