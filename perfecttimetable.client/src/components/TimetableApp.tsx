import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { CourseTimetable } from './CourseTimetable';
import { SelectionSummary } from './SelectionSummary';

import type { CourseModel, TimeSlot } from '../api/models';

dayjs.extend(customParseFormat);

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
    const [selectedSlotsByCourse, setSelectedSlotsByCourse] = useState<Record<number, TimeSlot[]>>({});

    useEffect(() => {
        void loadTimetable();
    }, []);

    if (error) {
        return <p role="alert">Failed to load timetable: {error}</p>;
    }

    if (!model) {
        return <p>Loading timetable...</p>;
    }

    const dayValues = model.days ?? [];
    const friendlyDays = dayValues.map((dayValue) => dayNames[dayValue] ?? `Day ${dayValue}`);
    const timeLabels = createTimeLabels(model.startTime, model.blockDuration, model.blocks);
    const dayLabelLookup = dayValues.reduce<Record<number, string>>((lookup, value, index) => {
        lookup[value] = friendlyDays[index] ?? `Day ${value}`;
        return lookup;
    }, {});

    return (
        <div className="timetable">
            <header>
                <h1>Perfect Timetable</h1>
                <p>Starting {formatTime(model.startTime)}</p>
                <p>{duration(model.blockDuration)}-minute blocks</p>
                <p>{model.blocks} blocks per day</p>
            </header>

            <section className="timetable__grid">
                {model.courses.map((course) => (
                    <div key={course.id} className="timetable__course">
                        <CourseCard course={course} friendlyDays={friendlyDays} />
                        <CourseTimetable
                            courseId={course.id}
                            friendlyDays={friendlyDays}
                            dayValues={dayValues}
                            timeLabels={timeLabels}
                            selectedSlots={selectedSlotsByCourse[course.id] ?? []}
                            onToggleSlot={(day, startBlock) => handleSlotToggle(course.id, day, startBlock)}
                        />
                        <SelectionSummary
                            courseName={course.name}
                            selections={selectedSlotsByCourse[course.id] ?? []}
                            dayLabelLookup={dayLabelLookup}
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

    function handleSlotToggle(courseId: number, day: number, startBlock: number) {
        setSelectedSlotsByCourse((previous) => {
            const currentSlots = previous[courseId] ?? [];
            const exists = currentSlots.some((slot) => slot.day === day && slot.startBlock === startBlock);
            const updatedSlots = exists
                ? currentSlots.filter((slot) => !(slot.day === day && slot.startBlock === startBlock))
                : [...currentSlots, { day, startBlock }];

            return {
                ...previous,
                [courseId]: updatedSlots,
            };
        });
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
