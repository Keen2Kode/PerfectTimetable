import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { CourseTimetable } from './CourseTimetable';
import { SelectionSummary } from './SelectionSummary';

import type { CourseModel, TimeSlot, TimetableDay } from '../api/models';

dayjs.extend(customParseFormat);


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

    const friendlyDays = model.days;

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
                            model={model}
                            selectedSlots={selectedSlotsByCourse[course.id] ?? []}
                            onToggleSlot={(day, startBlock) => handleSlotToggle(course.id, day, startBlock)}
                        />
                        <SelectionSummary
                            courseName={course.name}
                            selections={selectedSlotsByCourse[course.id] ?? []}
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

    function handleSlotToggle(courseId: number, day: TimetableDay, startBlock: number) {
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


export default TimetableApp;
