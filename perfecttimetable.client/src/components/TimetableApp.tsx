import * as React from 'react';
import { useEffect, useState } from 'react';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';

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

    return (
        <div className="timetable">
            <header>
                <h1>Perfect Timetable</h1>
                <p>
                    Starting {formatTime(model.startTime)}, block length{' '}
                    {formatDuration(model.blockDuration)}, {model.blocks} blocks per day.
                </p>
            </header>

            <section className="timetable__grid">
                {model.courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        friendlyDays={friendlyDays}
                    />
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
    const [hours, minutes] = value.split(':');
    if (hours === undefined || minutes === undefined) {
        return value;
    }

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatDuration(value: string) {
    const [hours, minutes] = value.split(':');
    if (hours === undefined || minutes === undefined) {
        return value;
    }

    const totalMinutes = Number(hours) * 60 + Number(minutes);
    if (totalMinutes % 60 === 0) {
        const hrs = totalMinutes / 60;
        return `${hrs} hour${hrs === 1 ? '' : 's'}`;
    }

    if (Number(hours) === 0) {
        return `${Number(minutes)} minutes`;
    }

    return `${Number(hours)}h ${Number(minutes)}m`;
}

export default TimetableApp;
