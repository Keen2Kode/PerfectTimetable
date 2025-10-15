import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Slider from '@mui/material/Slider';

import type { ModelView } from '../api/modelView';
import { parseMinutes, parseTime, formatTime } from '../utils/timetableTime';
import './TimetableScheduleControls.css';

dayjs.extend(customParseFormat);
interface TimetableScheduleControlsProps {
    view: ModelView;
    setView: (view: ModelView) => void;
}

const BLOCK_DURATION_OPTIONS = [15, 30, 60] as const;
const FULL_DAY_MINUTES = 24 * 60;

const minutesToTimeString = (minutes: number): string => dayjs().startOf('day').add(minutes, 'minute').format('HH:mm:ss');
const formatMinutes = (minutes: number): string => formatTime(minutesToTimeString(minutes));

const timeStringToMinutes = (value: string): number => {
    const parsed = parseTime(value);
    if (!parsed.isValid()) {
        return 0;
    }
    return parsed.hour() * 60 + parsed.minute();
};

const clampToDay = (value: number): number => Math.min(Math.max(value, 0), FULL_DAY_MINUTES);

const alignToStep = (value: number, step: number): number => {
    if (step <= 0) {
        return clampToDay(value);
    }
    const aligned = Math.round(clampToDay(value) / step) * step;
    return clampToDay(aligned);
};

const toAllowedBlockMinutes = (value: number): number =>
    BLOCK_DURATION_OPTIONS.reduce((closest, option) =>
        Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
        BLOCK_DURATION_OPTIONS[0]);

const normalizeRange = (start: number, end: number, step: number): [number, number] => {
    const effectiveStep = Math.max(step, BLOCK_DURATION_OPTIONS[0]);
    let nextStart = alignToStep(start, effectiveStep);
    let nextEnd = alignToStep(end, effectiveStep);

    if (nextEnd < nextStart) {
        [nextStart, nextEnd] = [nextEnd, nextStart];
    }

    if (nextEnd - nextStart < effectiveStep) {
        if (nextStart + effectiveStep <= FULL_DAY_MINUTES) {
            nextEnd = nextStart + effectiveStep;
        } else {
            nextEnd = FULL_DAY_MINUTES;
            nextStart = Math.max(0, nextEnd - effectiveStep);
            nextStart = alignToStep(nextStart, effectiveStep);
            nextEnd = alignToStep(nextStart + effectiveStep, effectiveStep);
        }
    }

    return [nextStart, nextEnd];
};


export function TimetableScheduleControls({ view, setView }: TimetableScheduleControlsProps) {
    const [blockMinutes, setBlockMinutes] = useState(() => toAllowedBlockMinutes(parseMinutes(view.blockDuration)));
    const [rangeMinutes, setRangeMinutes] = useState<[number, number]>(() => {
        const start = timeStringToMinutes(view.startTime);
        const block = toAllowedBlockMinutes(parseMinutes(view.blockDuration));
        const end = start + block * view.blocks;
        return normalizeRange(start, end, block);
    });

    useEffect(() => {
        const start = timeStringToMinutes(view.startTime);
        const block = toAllowedBlockMinutes(parseMinutes(view.blockDuration));
        const end = start + block * view.blocks;

        setBlockMinutes(block);
        setRangeMinutes(normalizeRange(start, end, block));
    }, [view]);



    const handleBlockDurationChange = (_event: Event, value: number) => {
        const nextBlockMinutes = Number(value);
        setBlockMinutes(nextBlockMinutes);
        setRangeMinutes((current) => normalizeRange(current[0], current[1], nextBlockMinutes));
    };

    const handleRangeChange = (_event: Event, value: number | number[]) => {
        if (!Array.isArray(value)) {
            return;
        }
        const [rawStart, rawEnd] = value;
        setRangeMinutes(normalizeRange(rawStart, rawEnd, blockMinutes));
    };

    const handleApply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const [start, end] = normalizeRange(rangeMinutes[0], rangeMinutes[1], blockMinutes);
        const updatedStart = minutesToTimeString(start);
        const updatedBlockDuration = minutesToTimeString(blockMinutes);
        const span = Math.max(blockMinutes, end - start);
        const updatedBlocks = Math.max(1, Math.round(span / blockMinutes));

        setView(view.withUpdatedSchedule(updatedStart, updatedBlockDuration, updatedBlocks));
    };

    return (
        <form className="timetable-schedule" onSubmit={handleApply}>
            <div className="timetable-schedule__control">
                <label htmlFor="timetable-block-duration">Block duration</label>
                <Slider
                    id="timetable-block-duration"
                    min={BLOCK_DURATION_OPTIONS[0]}
                    max={BLOCK_DURATION_OPTIONS.at(-1)}
                    step={null}
                    value={blockMinutes}
                    onChange={handleBlockDurationChange}
                    marks={BLOCK_DURATION_OPTIONS.map((option) => ({
                        value: option,
                        label: option.toString(),
                    }))}
                />
            </div>

            <div className="timetable-schedule__control timetable-schedule__control--range">
                <div className="timetable-schedule__range-header">
                    <label htmlFor="timetable-range">Time range</label>
                    <span>{formatMinutes(rangeMinutes[0])} – {formatMinutes(rangeMinutes[1])}</span>
                </div>
                <div className="timetable-schedule__range-scale" aria-hidden="true">
                    <span>{formatMinutes(0)}</span>
                    <span>{formatMinutes(FULL_DAY_MINUTES)}</span>
                </div>
                <Slider
                    id="timetable-range"
                    value={rangeMinutes}
                    min={0}
                    max={FULL_DAY_MINUTES}
                    step={blockMinutes}
                    onChange={handleRangeChange}
                />
            </div>

            <div className="timetable-schedule__actions">
                <button
                    type="submit"
                    className="timetable-schedule__apply-button"
                >
                    Apply
                </button>
            </div>
        </form>
    );
}

export default TimetableScheduleControls;
