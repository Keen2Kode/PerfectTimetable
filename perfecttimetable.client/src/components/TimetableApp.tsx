import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import SingleCourseTimetable from './SingleCourseTimetable';
import { GeneratedTimetableCarousel } from './GeneratedTimetableCarousel';

import type { Timetable as ApiTimetable } from '../api/models';
import { ModelView } from '../api/modelView';
import { TimetableSlotView } from '../api/timetableSlot';
import { parseMinutes, formatTime } from '../utils/timetableTime';
import SaveSelectionsButton from './SaveSelectionsButton';
import { fetchTimetable } from '../api/timetableApi';
import SelectionSummary from './SelectionSummary';

dayjs.extend(customParseFormat);

export function TimetableApp() {
    const [view, setView] = useState<ModelView | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedTimetables, setGeneratedTimetables] = useState<ApiTimetable[]>([]);

    useEffect(() => {
        void loadTimetable();
    }, []);

    if (error) {
        return <p role="alert">Failed to load timetable: {error}</p>;
    }

    if (!view) {
        return <p>Loading timetable...</p>;
    }

    return (
        <div className="timetable">
            <header>
                <h1>Perfect Timetable</h1>
                <p>Starting {formatTime(view.startTime)}</p>
                <p>{parseMinutes(view.blockDuration)}-minute blocks</p>
                <p>{view.blocks} blocks per day</p>
            </header>

            <section className="timetable__grid">
                {view.getCourses().map((courseView) => (
                    <div key={courseView.id} className="timetable__course">
                        <CourseCard course={courseView.toCourse()} friendlyDays={view.days} />
                        <SingleCourseTimetable
                            modelView={view}
                            courseView={courseView}
                            onChange={(slots) => updateCourseSlots(courseView.id, slots)}
                        />
                        <SelectionSummary courseName={courseView.name} selections={courseView.getSlots()} />
                    </div>
                ))}
            </section>

            <SaveSelectionsButton
                modelView={view}
                onGenerate={setGeneratedTimetables}
            />

            <GeneratedTimetableCarousel
                modelView={view}
                timetables={generatedTimetables}
            />
        </div>
    );

    async function loadTimetable() {
        try {
            const model = await fetchTimetable();
            setView(new ModelView(model));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    function updateCourseSlots(courseId: number, slots: TimetableSlotView[]) {
        setView((previous) => {
            if (!previous) return previous;
            return previous.withUpdatedCourse(courseId, slots);
        });
    }
}

export default TimetableApp;

