import { useEffect, useState } from 'react';
import './TimetableApp.css';
import { CourseCard, AddCourseCard } from './CourseCard';
import { GeneratedTimetableCarousel } from './GeneratedTimetableCarousel';
import { TimetableOptionsDialog } from './TimetableOptionsDialog';
import { TimetableScheduleControls } from './TimetableScheduleControls';

import type { Timetable as ApiTimetable } from '../api/models';
import { ModelView } from '../api/modelView';
import SaveSelectionsButton from './SaveSelectionsButton';
import { fetchTimetable } from '../api/timetableApi';
import { defaultTimetableOptions, type TimetableOptions } from '../api/timetableOptions';

export function TimetableApp() {
    const [view, setView] = useState<ModelView | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [generatedTimetables, setGeneratedTimetables] = useState<ApiTimetable[]>([]);
    const [timetableOptions, setTimetableOptions] = useState<TimetableOptions>(defaultTimetableOptions);
    const [optionsOpen, setOptionsOpen] = useState(false);

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
                <TimetableScheduleControls
                    view={view}
                    setView={setView}
                />
            </header>

            <section className="timetable__grid">
                {view.getCourses().map((courseView) => (
                    <div key={courseView.id} className="timetable__course">
                        <CourseCard
                            modelView={view}
                            courseView={courseView}
                            setView={setView}
                        />
                    </div>
                ))}
                <div className="timetable__course">
                    <AddCourseCard
                        setView={setView}
                        nextColour={view.colours.peekNextColour()}
                    />
                </div>
            </section>

            <div className="timetable__actions-row">
                <SaveSelectionsButton
                    modelView={view}
                    options={timetableOptions}
                    onGenerate={setGeneratedTimetables}
                />
                <button
                    type="button"
                    className="timetable__actions-button timetable__actions-button--secondary"
                    onClick={() => setOptionsOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={optionsOpen}
                >
                    Options
                </button>
                <TimetableOptionsDialog
                    open={optionsOpen}
                    oldOptions={timetableOptions}
                    onClose={() => setOptionsOpen(false)}
                    onOptionsChange={setTimetableOptions}
                />
            </div>

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
}

export default TimetableApp;
