import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { SingleCourseTimetable } from './MultiCourseTimetable';
import { GeneratedTimetableCarousel } from './GeneratedTimetableCarousel';

import type { CourseModel, Timetable as ApiTimetable } from '../api/models';
import { TimetableSlotView } from '../api/timetableSlot';
import { parseMinutes, formatTime } from '../utils/timetableTime';
import SaveSelectionsButton from './SaveSelectionsButton';
import { fetchTimetable } from '../api/timetableApi';
import SelectionSummary from './SelectionSummary';

dayjs.extend(customParseFormat);

export function TimetableApp() {
    const [model, setModel] = useState<CourseModel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlotsByCourse, setSelectedSlotsByCourse] = useState<Record<number, TimetableSlotView[]>>({});
    const [generatedTimetables, setGeneratedTimetables] = useState<ApiTimetable[]>([]);

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
                                onSelectionChange={handleSelectionChange}
                                timetableSlots={selections}
                                singleCourse={course}
                            />
                            <SelectionSummary courseName={course.name} selections={selections} />
                        </div>
                    );
                })}
            </section>

            <SaveSelectionsButton
                model={model}
                onGenerate={handleGeneratedTimetables}
            />

            <GeneratedTimetableCarousel
                model={model}
                timetables={generatedTimetables}
            />
        </div>
    );

    async function loadTimetable() {
        try {
            const modelResponse = await fetchTimetable();
            setModel(modelResponse);

            const slotsByCourse: Record<number, TimetableSlotView[]> = {};
            for (const course of modelResponse.courses) {
                slotsByCourse[course.id] = course.timeslots.map((timeSlot) => new TimetableSlotView(course, timeSlot));
            }
            setSelectedSlotsByCourse(slotsByCourse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    function handleSelectionChange(courseId: number, slots: TimetableSlotView[]) {
        setSelectedSlotsByCourse((prev) => ({ ...prev, [courseId]: slots }));
    }

    function handleGeneratedTimetables(timetables: ApiTimetable[]) {
        setGeneratedTimetables(timetables.filter((timetable) => timetable.slots?.length));
    }
}

export default TimetableApp;
