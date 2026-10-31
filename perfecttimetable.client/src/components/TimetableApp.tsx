import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import './TimetableApp.css';
import { CourseCard } from './CourseCard';
import { CourseCardAdd } from './CourseCardAdd';
import { GeneratedTimetableCarousel } from './GeneratedTimetableCarousel';
import { TimetableOptionsDialog } from './TimetableOptionsDialog';
import { TimetableScheduleControls } from './TimetableScheduleControls';

import type { CourseModel, Timetable as ApiTimetable } from '../api/models';
import { ModelView } from '../api/modelView';
import SaveSelectionsButton from './SaveSelectionsButton';
import { fetchTimetable } from '../api/timetableApi';
import { defaultTimetableOptions, type TimetableOptions } from '../api/timetableOptions';
import BackgroundTexture from './icons/BackgroundTexture';
import { useLocalStorage } from 'usehooks-ts';
import perfectableLogo from '../assets/perfectable logo 1.png';

export function TimetableApp() {
    const [storedModel, setStoredModel] = useLocalStorage<CourseModel | null>('perfect-timetable:model', null);
    const [error, setError] = useState<string | null>(null);
    const [generatedTimetables, setGeneratedTimetables] = useState<ApiTimetable[]>([]);
    const [timetableOptions, setTimetableOptions] = useLocalStorage<TimetableOptions>('perfect-timetable:options', defaultTimetableOptions);
    const [optionsOpen, setOptionsOpen] = useState(false);

    const view = useMemo(() => (storedModel ? new ModelView(storedModel) : null), [storedModel]);

    const setView: Dispatch<SetStateAction<ModelView | null>> = useCallback((update) => {
        setStoredModel((previousModel) => {
            const previousView = previousModel && new ModelView(previousModel);

            const nextView =
                typeof update === 'function'
                    ? update(previousView)
                    : update;

            return nextView?.toCourseModel() ?? null;
        });
    }, [setStoredModel]);

    useEffect(() => {
        if (storedModel) {
            return;
        }

        const controller = new AbortController();

        fetchTimetable(controller.signal)
            .then((model) => {
                if (!controller.signal.aborted) {
                    setStoredModel(model);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                }
            });

        return () => controller.abort();
    }, [storedModel, setStoredModel]);

    if (error) {
        return <p role="alert">Failed to load timetable: {error}</p>;
    }

    if (!view) {
        return <p>Loading timetable...</p>;
    }

    return (
        <>
            <BackgroundTexture/>
            <div className="timetable">
                <h1 className="timetable__title">
                    <img
                        className="timetable__logo"
                        src={perfectableLogo}
                        alt="Perfectable"
                    />
                </h1>
                <TimetableScheduleControls
                    view={view}
                    setView={setView}
                />
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
                        <CourseCardAdd
                            modelView={view}
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
        </>
    );
}

export default TimetableApp;
