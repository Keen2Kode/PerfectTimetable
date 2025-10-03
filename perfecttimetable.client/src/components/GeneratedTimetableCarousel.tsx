import { useMemo, useState } from 'react';
import type { CourseModel } from '../api/models';
import { TimetableSlot } from '../api/timetableSlot';
import { MultiCourseTimetable } from './MultiCourseTimetable';
import './GeneratedTimetableCarousel.css';
import { ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';

const noopSelectionChange: (slots: TimetableSlot[]) => void = () => {};

type GeneratedTimetable = {
    id: string;
    slots: TimetableSlot[];
};

interface GeneratedTimetableCarouselProps {
    model: CourseModel;
}

export function GeneratedTimetableCarousel({ model }: GeneratedTimetableCarouselProps) {
    const timetables = useMemo(() => buildDummyTimetables(model), [model]);
    const [index, setIndex] = useState(0);

    const total = timetables.length;

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
    const current = timetables[activeIndex];

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
                    timetableSlots={current.slots}
                    onSelectionChange={noopSelectionChange}
                />
            </div>
        </section>
    );
}

function buildDummyTimetables(model: CourseModel): GeneratedTimetable[] {
    const courses = model.courses ?? [];
    if (courses.length === 0) {
        return [];
    }

    const maxOptions = courses.reduce((max, course) => Math.max(max, course.timeslots?.length ?? 0), 0);
    if (maxOptions === 0) {
        return [];
    }

    const variationCount = Math.min(3, maxOptions);

    return Array.from({ length: variationCount }, (_, planIndex) => ({
        id: `dummy-${planIndex}`,
        slots: courses.reduce<TimetableSlot[]>((acc, course, courseIndex) => {
            const options = course.timeslots ?? [];
            if (options.length === 0) {
                return acc;
            }

            const slotIndex = (courseIndex + planIndex) % options.length;
            acc.push(new TimetableSlot(course, options[slotIndex]));
            return acc;
        }, []),
    }));
}

export default GeneratedTimetableCarousel;



