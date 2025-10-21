import { useEffect, useMemo, useState } from 'react';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { ModelView } from '../api/modelView';
import { formatMinutes, minutesToTimeString, parseMinutes } from '../utils/timetableTime';
import { ApplyModelOptionsButton } from './ApplyModelOptionsButton';
import './TimetableScheduleControls.css';
import './SliderStyles.css';
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

    const schedule = useMemo(() => {
        const [start, end] = sortRange(rangeMinutes[0], rangeMinutes[1]);
        const span = Math.max(blockMinutes, end - start);
        const blocks = Math.max(1, Math.ceil(span / blockMinutes));

        return {
            start: minutesToTimeString(start),
            blockDuration: minutesToTimeString(blockMinutes),
            blocks,
        };
    }, [blockMinutes, rangeMinutes]);

    return (
        <form className="timetable-schedule" onSubmit={(event) => event.preventDefault()}>
            <div className="timetable-schedule__primary">
                <div className="timetable-schedule__control">
                    <label htmlFor="timetable-block-duration">Block duration</label>
                    <div className="timetable-schedule__block-duration">
                        <ToggleButtonGroup
                            id="timetable-block-duration"
                            className="timetable-schedule__block-toggle-group"
                            value={blockMinutes}
                            exclusive
                            onChange={(_event, value: number | null) => {
                                if (value !== null) {
                                    setBlockMinutes(value);
                                }
                            }}
                            aria-label="block duration"
                        >
                            {blockDurationOptions.map((option) => (
                                <ToggleButton
                                    key={option}
                                    value={option}
                                    aria-label={`${option} minutes`}
                                    className="timetable-schedule__block-toggle"
                                >
                                    {option}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        <span className="timetable-schedule__block-duration-label">minutes</span>
                    </div>
                </div>

                <div className="timetable-schedule__control timetable-schedule__control--range">
                    <div className="timetable-schedule__range-header">
                        <label htmlFor="timetable-range">Time range</label>
                        <span>{formatMinutes(rangeMinutes[0])} – {formatMinutes(rangeMinutes[1])}</span>
                    </div>
                    <Slider
                        id="timetable-range"
                        className="timetable-slider"
                        value={rangeMinutes}
                        min={0}
                        max={FULL_DAY_MINUTES}
                        step={blockMinutes}
                        onChange={(_: Event, [start, end]: number[]) => {
                            setRangeMinutes(sortRange(clampToDay(start), clampToDay(end)));
                        }}
                        disableSwap
                    />
                    <div className="timetable-schedule__range-scale" aria-hidden="true">
                        <span>{formatMinutes(0)}</span>
                        <span>{formatMinutes(FULL_DAY_MINUTES)}</span>
                    </div>
                </div>
            </div>

            <div className="timetable-schedule__actions">
                <ApplyModelOptionsButton
                    modelView={view}
                    startTime={schedule.start}
                    blockDuration={schedule.blockDuration}
                    blocks={schedule.blocks}
                    setView={setView}
                />
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
