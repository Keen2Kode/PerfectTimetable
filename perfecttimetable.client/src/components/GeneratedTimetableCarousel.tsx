import { useMemo, useState } from 'react';
import type { CourseModel } from '../api/models';
import { DayWeek } from '../api/models/dayWeek';
import { TimetableSlot } from '../api/timetableSlot';
import { MultiCourseTimetable } from './MultiCourseTimetable';
import './GeneratedTimetableCarousel.css';
import { ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';

const noopSelectionChange: (slots: TimetableSlot[]) => void = () => {};

type GeneratedTimetable = {
    id: string;
    label: string;
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
                <button
                    type="button"
                    className="generated-timetable__nav"
                    aria-label="Show previous timetable"
                    onClick={showPrevious}
                    disabled={disableNav}
                >
                    <ArrowLeftIcon aria-hidden className="generated-timetable__icon" />
                </button>
                <div className="generated-timetable__summary">
                    <h2 className="generated-timetable__title">{current.label}</h2>
                    <p className="generated-timetable__meta">
                        Timetable {activeIndex + 1} of {total}
                    </p>
                </div>
                <button
                    type="button"
                    className="generated-timetable__nav"
                    aria-label="Show next timetable"
                    onClick={showNext}
                    disabled={disableNav}
                >
                    <ArrowRightIcon aria-hidden className="generated-timetable__icon" />
                </button>
            </header>

            <div className="generated-timetable__calendar">
                <MultiCourseTimetable
                    model={model}
                    timetableSlots={current.slots}
                    onSelectionChange={noopSelectionChange}
                />
            </div>

            <ul className="generated-timetable__courses">
                {current.slots.map((slot) => (
                    <li key={slot.key()}>
                        <span className="generated-timetable__course-name">{slot.course.name}</span>
                        <span className="generated-timetable__course-block">
                            {DayWeek[slot.day]} - Block {slot.start}
                        </span>
                    </li>
                ))}
            </ul>
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
        label: `Preview Plan ${String.fromCharCode(65 + planIndex)}`,
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