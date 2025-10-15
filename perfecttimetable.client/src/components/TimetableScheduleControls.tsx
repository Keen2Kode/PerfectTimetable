import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Slider from '@mui/material/Slider';

import type { ModelView } from '../api/modelView';
import {
    parseMinutes,
    minutesToTimeString,
    formatMinutes
} from '../utils/timetableTime';
import './TimetableScheduleControls.css';
interface TimetableScheduleControlsProps {
    view: ModelView;
    setView: (view: ModelView) => void;
}

export function TimetableScheduleControls({ view, setView }: TimetableScheduleControlsProps) {
    const [blockMinutes, setBlockMinutes] = useState(() => toAllowedBlockMinutes(parseMinutes(view.blockDuration)));
    const [rangeMinutes, setRangeMinutes] = useState<[number, number]>(() => {
        const [start, , end] = initialValues(view)();
        return sortRange(start, end);
    });

    useEffect(() => {
        const [start, block, end] = initialValues(view)();
        setBlockMinutes(block);
        setRangeMinutes(sortRange(start, end));
    }, [view]);

    useEffect(() => {
        setRangeMinutes((current) => {
            const [start, end] = current;
            if (end - start >= blockMinutes) {
                return current;
            }
            const adjustedEnd = Math.min(FULL_DAY_MINUTES, start + blockMinutes);
            return sortRange(start, adjustedEnd);
        });
    }, [blockMinutes]);

    const handleApply = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const [start, end] = sortRange(rangeMinutes[0], rangeMinutes[1]);
        const span = Math.max(blockMinutes, end - start);
        const updatedBlocks = Math.max(1, span/blockMinutes);

        setView(view.withUpdatedSchedule(
            minutesToTimeString(start),
            minutesToTimeString(blockMinutes),
            updatedBlocks)
        );
    };

    return (
        <form className="timetable-schedule" onSubmit={handleApply}>
            <div className="timetable-schedule__control">
                <label htmlFor="timetable-block-duration">Block duration</label>
                <Slider
                    id="timetable-block-duration"
                    min={blockDurationOptions[0]}
                    max={blockDurationOptions.at(-1)}
                    step={null}
                    value={blockMinutes}
                    onChange={(_event: Event, value: number) => {
                        setBlockMinutes(Number(value));
                    }}
                    marks={blockDurationOptions.map((option) => ({
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
                    onChange={(_: Event, [start, end]: number[]) => {
                        setRangeMinutes(sortRange(clampToDay(start), clampToDay(end)));
                    }}
                    disableSwap
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

const FULL_DAY_MINUTES = 24 * 60;
const clampToDay = (minutes: number): number =>
    Math.min(Math.max(minutes, 0), FULL_DAY_MINUTES);
const blockDurationOptions = [15, 30, 60];


const toAllowedBlockMinutes = (value: number): number =>
    blockDurationOptions.reduce((closest, option) =>
        Math.abs(option - value) < Math.abs(closest - value) ? option : closest);

const sortRange = (start: number, end: number): [number, number] => (start <= end ? [start, end] : [end, start]);

const initialValues = (view: ModelView) => () => {
    const start = clampToDay(parseMinutes(view.startTime));
    const block = toAllowedBlockMinutes(parseMinutes(view.blockDuration));
    const end = clampToDay(start + block * view.blocks);

    return [start, block, end];
};

export default TimetableScheduleControls;
