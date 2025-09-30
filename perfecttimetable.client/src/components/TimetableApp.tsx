import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { CourseTimetable } from './CourseTimetable';
import { SelectionSummary } from './SelectionSummary';

import type { CourseModel } from '../api/models';
import { Slot } from '../api/slot';
import { parseMinutes, formatTime } from '../utils/timetableTime';
import SaveSelectionsButton from './SaveSelectionsButton';
import { fetchTimetable } from '../api/timetableApi';

dayjs.extend(customParseFormat);

/**
 * Fetches the timetable data from the backend and renders a simple summary for
 * each course. This is intentionally lightweight so you can evolve it into the
 * full Perfect Timetable UI.
 */
export function TimetableApp() {
    const [model, setModel] = useState<CourseModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlotsByCourse, setSelectedSlotsByCourse] = useState<Record<number, Slot[]>>({});

    useEffect(() => {
        void loadTimetable();
    }, []);

    if (error) {
        return <p role="alert">Failed to load timetable: {error}</p>;
    }

    if (!model) {
        return <p>Loading timetable...</p>;
    }

    return (
        <div className="timetable">
            <header>
                <h1>Perfect Timetable</h1>
                <p>Starting {formatTime(model.startTime)}</p>
                <p>{parseMinutes(model.blockDuration)}-minute blocks</p>
                <p>{model.blocks} blocks per day</p>
            </header>

            <section className="timetable__grid">
                {model.courses.map((course) => {
                    const selections = selectedSlotsByCourse[course.id] ?? [];
                    return (
                        <div key={course.id} className="timetable__course">
                            <CourseCard course={course} friendlyDays={model.days} />
                            <CourseTimetable
                                model={model}
                                selectedSlots={selections}
                                onSelectionChange={(slots) => handleSelectionChange(course.id, slots)}
                                blockLength={Math.max(1, course.durationBlocks)}
                            />
                            <SelectionSummary courseName={course.name} selections={selections} />
                        </div>
                    );
                })}
            </section>

            <SaveSelectionsButton model={model} selections={selectedSlotsByCourse} />
        </div>
    );

    async function loadTimetable() {
        try {
            const model = await fetchTimetable();
            setModel(model);

            const slotsByCourse: Record<number, Slot[]> = {};
            for (const course of model.courses) {
                slotsByCourse[course.id] = course.timeslots.map((timeSlot) => Slot.fromTimeSlot(timeSlot));
            }
            setSelectedSlotsByCourse(slotsByCourse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    function handleSelectionChange(courseId: number, slots: Slot[]) {
        setSelectedSlotsByCourse((prev) => ({ ...prev, [courseId]: slots }));
    }
}


export default TimetableApp;

