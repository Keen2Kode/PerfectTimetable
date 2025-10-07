import { useEffect, useMemo, useState } from 'react';
import type { Timetable as ApiTimetable } from '../api/models';
import type { TimetableOptions } from '../api/timetableOptions';
import { ModelView } from '../api/modelView';
import { MultiCourseTimetable } from './MultiCourseTimetable';
import './GeneratedTimetableCarousel.css';
import { ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';
import { TimetableOptionsDialog } from './TimetableOptionsDialog';

type GeneratedTimetableCarouselProps = {
    modelView: ModelView;
    timetables: ApiTimetable[];
    options: TimetableOptions;
    onOptionsChange: (options: TimetableOptions) => void;
};

export function GeneratedTimetableCarousel({ modelView, timetables, options, onOptionsChange }: GeneratedTimetableCarouselProps) {
    const [index, setIndex] = useState(0);
    const [optionsOpen, setOptionsOpen] = useState(false);

    const normalizedTimetables = useMemo(
        () => ModelView.fromApiTimetables(timetables),
        [timetables],
    );

    const total = normalizedTimetables.length;

    useEffect(() => {
        if (total > 0) {
            setIndex(0);
        }
    }, [total]);

    if (total === 0) {
        return;
    }

    const disableNav = total <= 1;
    const activeIndex = ((index % total) + total) % total;
    const current = normalizedTimetables[activeIndex];

    const showPrevious = () => {
        if (disableNav) return;
        setIndex((prev) => (prev + total - 1) % total);
    };

    const showNext = () => {
        if (disableNav) return;
        setIndex((prev) => (prev + 1) % total);
    };

    return (
        <section className="generated-timetable" aria-label="Generated timetables">
            <header className="generated-timetable__header">
                <div className="generated-timetable__rail">
                    <button
                        type="button"
                        className="generated-timetable__nav generated-timetable__nav--prev"
                        aria-label="Show previous timetable"
                        onClick={showPrevious}
                        disabled={disableNav}
                    >
                        <ArrowLeftIcon aria-hidden className="generated-timetable__icon" />
                    </button>
                    <div className="generated-timetable__rail-divider" />
                    <button
                        type="button"
                        className="generated-timetable__nav generated-timetable__nav--next"
                        aria-label="Show next timetable"
                        onClick={showNext}
                        disabled={disableNav}
                    >
                        <ArrowRightIcon aria-hidden className="generated-timetable__icon" />
                    </button>
                </div>

                <div className="generated-timetable__summary-shell">
                    <div className="generated-timetable__summary">
                        <p className="generated-timetable__meta">
                            Timetable {activeIndex + 1} of {total}
                        </p>
                        <button
                            type="button"
                            className="generated-timetable__options-button"
                            onClick={() => setOptionsOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={optionsOpen}
                        >
                            Options
                        </button>

                        <TimetableOptionsDialog
                            open={optionsOpen}
                            oldOptions={options}
                            onClose={() => setOptionsOpen(false)}
                            onOptionsChange={onOptionsChange}
                        />
                    </div>
                </div>
            </header>

            <div className="generated-timetable__calendar">
                <MultiCourseTimetable
                    modelView={modelView}
                    timetableSlots={current}
                />
            </div>

        </section>
    );
}

export default GeneratedTimetableCarousel;
