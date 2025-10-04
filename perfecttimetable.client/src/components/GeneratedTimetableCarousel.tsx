import { useEffect, useMemo, useState } from 'react';
import type { CourseModel, Timetable as ApiTimetable } from '../api/models';
import { ModelView } from '../api/modelView';
import { MultiCourseTimetable } from './MultiCourseTimetable';
import './GeneratedTimetableCarousel.css';
import { ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';

type GeneratedTimetableCarouselProps = {
    model: CourseModel;
    timetables: ApiTimetable[];
};

export function GeneratedTimetableCarousel({ model, timetables }: GeneratedTimetableCarouselProps) {
    const [index, setIndex] = useState(0);

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
        return (
            <section className="generated-timetable" aria-live="polite">
                <h2 className="generated-timetable__title">Generated Timetables</h2>
                <p className="generated-timetable__placeholder">
                    Save your selections to preview the generated timetable combinations here.
                </p>
            </section>
        );
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
                    </div>
                </div>
            </header>

            <div className="generated-timetable__calendar">
                <MultiCourseTimetable
                    model={model}
                    timetableSlots={current}
                />
            </div>
        </section>
    );
}

export default GeneratedTimetableCarousel;
