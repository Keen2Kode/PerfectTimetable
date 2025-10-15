import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Slider from '@mui/material/Slider';

import type { ModelView } from '../api/modelView';
import { parseMinutes, parseTime, formatTime } from '../utils/timetableTime';
import './TimetableScheduleControls.css';

dayjs.extend(customParseFormat);

const BLOCK_DURATION_MINUTES = 15;
const BLOCK_DURATION_MAX_MINUTES = 60;
const BLOCK_DURATION_STEP_MINUTES = 15;

const minutesToTimeString = (minutes: number): string =>
    dayjs().startOf('day').add(minutes, 'minute').format('HH:mm:ss');

const timeStringToMinutes = (value: string): number => {
    const parsed = parseTime(value);
    if (!parsed.isValid()) {
        return 0;
    }
    return parsed.hour() * 60 + parsed.minute();
};

const alignToStep = (value: number, min: number, max: number, step: number): number => {
    if (max <= min) {
        return min;
    }
    const bounded = Math.min(Math.max(value, min), max);
    const offset = bounded - min;
    const steps = Math.round(offset / step);
    const aligned = min + steps * step;
    if (aligned > max) {
        return max;
    }
    if (aligned < min) {
        return min;
    }
    return aligned;
};

interface TimetableScheduleControlsProps {
    view: ModelView;
    setView: (view: ModelView) => void;
}

export function TimetableScheduleControls({ view, setView }: TimetableScheduleControlsProps) {
    const [blockMinutes, setBlockMinutes] = useState(() => parseMinutes(view.blockDuration));
    const [startMinutes, setStartMinutes] = useState(() => timeStringToMinutes(view.startTime));
    const [endMinutes, setEndMinutes] = useState(() => {
        const start = timeStringToMinutes(view.startTime);
        const block = parseMinutes(view.blockDuration);
        return start + block * view.blocks;
    });

    useEffect(() => {
        const start = timeStringToMinutes(view.startTime);
        const block = parseMinutes(view.blockDuration);
        const end = start + block * view.blocks;

        setBlockMinutes(block);
        setStartMinutes(start);
        setEndMinutes(end);
    }, [view]);

    const viewStartMinutes = timeStringToMinutes(view.startTime);
    const viewBlockMinutes = parseMinutes(view.blockDuration);
    const viewEndMinutes = viewStartMinutes + viewBlockMinutes * view.blocks;

    const effectiveBlockMinutes = Math.max(blockMinutes, BLOCK_DURATION_MINUTES);
    const rangeMin = viewStartMinutes;
    const rangeMax = rangeMin + effectiveBlockMinutes * view.blocks;
    const startSliderMax = Math.max(rangeMin, rangeMax - effectiveBlockMinutes);

    const alignedStartMinutes = alignToStep(startMinutes, rangeMin, startSliderMax, effectiveBlockMinutes);
    const minEnd = alignedStartMinutes + effectiveBlockMinutes;
    const alignedEndMinutes = alignToStep(endMinutes, minEnd, rangeMax, effectiveBlockMinutes);

    const hasChanges =
        effectiveBlockMinutes !== viewBlockMinutes ||
        alignedStartMinutes !== viewStartMinutes ||
        alignedEndMinutes !== viewEndMinutes;

    const handleBlockDurationChange = (_event: Event, value: number | number[]) => {
        const rawValue = Array.isArray(value) ? value[0] : value;
        const nextBlockMinutes = Number(rawValue);
        const nextRangeMax = rangeMin + nextBlockMinutes * view.blocks;
        const nextStartMax = Math.max(rangeMin, nextRangeMax - nextBlockMinutes);
        const nextStart = alignToStep(alignedStartMinutes, rangeMin, nextStartMax, nextBlockMinutes);
        const nextEndMin = nextStart + nextBlockMinutes;
        const nextEnd = alignToStep(Math.max(alignedEndMinutes, nextEndMin), nextEndMin, nextRangeMax, nextBlockMinutes);

        setBlockMinutes(nextBlockMinutes);
        setStartMinutes(nextStart);
        setEndMinutes(nextEnd);
    };

    const handleRangeChange = (_event: Event, value: number | number[]) => {
        if (!Array.isArray(value)) {
            return;
        }
        const [rawStart, rawEnd] = value;
        const currentRangeMax = rangeMin + effectiveBlockMinutes * view.blocks;
        const nextStart = alignToStep(rawStart, rangeMin, Math.max(rangeMin, currentRangeMax - effectiveBlockMinutes), effectiveBlockMinutes);
        const nextEndMin = nextStart + effectiveBlockMinutes;
        const nextEnd = alignToStep(rawEnd, nextEndMin, currentRangeMax, effectiveBlockMinutes);

        setStartMinutes(nextStart);
        setEndMinutes(nextEnd);
    };

    const handleApply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!hasChanges) {
            return;
        }

        const updatedStart = minutesToTimeString(alignedStartMinutes);
        const updatedBlockDuration = minutesToTimeString(effectiveBlockMinutes);
        const updatedBlocks = Math.max(1, Math.round((alignedEndMinutes - alignedStartMinutes) / effectiveBlockMinutes));

        setView(view.withUpdatedSchedule(updatedStart, updatedBlockDuration, updatedBlocks));
    };

    return (
        <form className="timetable-schedule" onSubmit={handleApply}>
            <div className="timetable-schedule__control">
                <label htmlFor="timetable-block-duration">Block duration</label>
                <Slider
                    id="timetable-block-duration"
                    min={BLOCK_DURATION_MINUTES}
                    max={BLOCK_DURATION_MAX_MINUTES}
                    step={BLOCK_DURATION_STEP_MINUTES}
                    value={effectiveBlockMinutes}
                    onChange={handleBlockDurationChange}
                    marks={[
                        { value: 15, label: '15' },
                        { value: 30, label: '30' },
                        { value: 45, label: '45' },
                        { value: 60, label: '60' },
                    ]}
                />
            </div>

            <div className="timetable-schedule__control timetable-schedule__control--range">
                <div className="timetable-schedule__range-header">
                    <label htmlFor="timetable-range">Time range</label>
                    <span>{formatTime(minutesToTimeString(alignedStartMinutes))} – {formatTime(minutesToTimeString(alignedEndMinutes))}</span>
                </div>
                <div className="timetable-schedule__range-scale" aria-hidden="true">
                    <span>{formatTime(minutesToTimeString(rangeMin))}</span>
                    <span>{formatTime(minutesToTimeString(rangeMax))}</span>
                </div>
                <Slider
                    id="timetable-range"
                    value={[alignedStartMinutes, alignedEndMinutes]}
                    min={rangeMin}
                    max={rangeMax}
                    step={effectiveBlockMinutes}
                    onChange={handleRangeChange}
                    sx={{ color: '#3f47ff' }}
                />
            </div>

            <div className="timetable-schedule__actions">
                <button
                    type="submit"
                    className="timetable-schedule__apply-button"
                    disabled={!hasChanges}
                >
                    Apply
                </button>
            </div>
        </form>
    );
}

export default TimetableScheduleControls;
