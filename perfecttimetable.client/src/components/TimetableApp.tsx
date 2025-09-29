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
                        <CourseCard course={course} friendlyDays={model.days} />
                        <CourseTimetable
                            courseId={course.id}
                            model={model}
                            selectedSlots={selectedSlotsByCourse[course.id] ?? []}
                            onSelectionChange={(slots) => handleSelectionChange(course.id, slots)}
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

    function handleSelectionChange(courseId: number, slots: TimeSlot[]) {
        setSelectedSlotsByCourse((prev) => ({ ...prev, [courseId]: slots }));
    };

    //function handleSlotToggle(courseId: number, day: TimetableDay, startBlock: number) {
    //    setSelectedSlotsByCourse(oldSelectedSlots => {
    //        const slots = oldSelectedSlots[courseId] ?? [];
    //        const i = slots.findIndex(s => s.day === day && s.startBlock === startBlock);

    //        const selectedSlots = [...slots];                    
    //        if (i >= 0) selectedSlots.splice(i, 1);             
    //        else selectedSlots.push({ day, startBlock });       

    //        return { ...oldSelectedSlots, [courseId]: selectedSlots };
    //    });
    //}

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
