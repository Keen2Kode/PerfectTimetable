import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { SingleCourseTimetable } from './MultiCourseTimetable';
//import { SelectionSummary } from './SelectionSummary';

import type { CourseModel } from '../api/models';
//import { Slot } from '../api/slot';
import { TimetableSlot } from '../api/timetableSlot';
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
    const [selectedSlotsByCourse, setSelectedSlotsByCourse] = useState<Record<number, TimetableSlot[]>>({});

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
                            <SingleCourseTimetable
                                model={model}
                                onSelectionChange={(slots: TimetableSlot[]) => handleSelectionChange(course.id, slots)}
                                timetableSlots={selections}
                                singleCourse={course}
                            />
                            {/*<SelectionSummary courseName={course.name} selections={selections} />*/}
                        </div>
                    );
                })}
            </section>

            <SaveSelectionsButton model={model} />
        </div>
    );

    async function loadTimetable() {
        try {
            const model = await fetchTimetable();
            setModel(model);

            const slotsByCourse: Record<number, TimetableSlot[]> = {};
            for (const course of model.courses) {
                slotsByCourse[course.id] = course.timeslots.map((timeSlot) => new TimetableSlot(course, timeSlot));
            }
            setSelectedSlotsByCourse(slotsByCourse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    function handleSelectionChange(courseId: number, slots: TimetableSlot[]) {
        setSelectedSlotsByCourse((prev) => ({ ...prev, [courseId]: slots }));
    }
}

export default TimetableApp;

