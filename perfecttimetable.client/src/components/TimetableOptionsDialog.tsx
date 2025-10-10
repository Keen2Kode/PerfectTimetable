import { useEffect, useState } from 'react';
import './TimetableOptionsDialog.css';

type TimetableOptionsState = {
    distanceScore: number | null;
    blockLengthFilter: number | null;
};

type TimetableOptionsDialogProps = {
    open: boolean;
    oldOptions: TimetableOptionsState;
    onClose: () => void;
    onOptionsChange: (options: TimetableOptionsState) => void;
};

//const defaultScoring: NonNullable<DistanceScoring> = {
//    slotDistanceMultiplier: 2,
//    differentDayScore: 8,
//};

//const defaultFilter: NonNullable<BlockLengthFilter> = {
//    maxBlockLength: 4,
//};

const normalizeOptions = (options: TimetableOptionsState): TimetableOptionsState => ({
    distanceScore: options.distanceScore,
    blockLengthFilter: options.blockLengthFilter,
});

export function TimetableOptionsDialog({ open, oldOptions, onClose, onOptionsChange }: TimetableOptionsDialogProps) {
    const [options, setOptions] = useState<TimetableOptionsState>(() => normalizeOptions(oldOptions));

    useEffect(() => {
        if (open) {
            setOptions(normalizeOptions(oldOptions));
        }
    }, [open, oldOptions]);

    if (!open) {
        return null;
    }

    const updateDistanceScore = (value: number) => {
        setOptions((previous) => ({
            ...previous,
            distanceScore: value,
        }));
    };


    const updateBlockLength = (value: number | null) => {
        setOptions((previous) => ({
            ...previous,
            blockLengthFilter: value,
        }));
    };

    return (
        <div
            className="timetable-options__overlay"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="timetable-options__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Timetable options"
                onClick={(event) => event.stopPropagation()}
            >
                <section className="timetable-options__section">
                    <h2 className="timetable-options__heading">Scoring</h2>
                    <label
                        className="timetable-options__slider-label"
                        id="slot-distance-label"
                        htmlFor="slot-distance-slider"
                    >
                        Slot distance weight
                    </label>
                    <input
                        id="slot-distance-slider"
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={options.distanceScore ?? 0}
                        onChange={(event) => updateDistanceScore(Number(event.target.value))}
                        className="timetable-options__slider"
                        aria-labelledby="slot-distance-label slot-distance-caption"
                    />
                    <div className="timetable-options__slider-caption" id="slot-distance-caption">
                        <span>Lower spread</span>
                        <span>Higher spread</span>
                    </div>

                </section>

                <section className="timetable-options__section">
                    <h2 className="timetable-options__heading">Filters</h2>
                    <label className="timetable-options__field">
                        <input
                            type="checkbox"
                            checked={options.blockLengthFilter !== null}
                            onChange={(event) => { if (Boolean(event.target.value) === false) updateBlockLength(null) }}
                        />
                        Block Length
                    </label>
                    <label className="timetable-options__field">
                        <span>Max block length</span>
                        <input
                            type="number"
                            min={1}
                            max={12}
                            value={options.blockLengthFilter ?? 12}
                            onChange={(event) => updateBlockLength(Number(event.target.value))}
                            disabled={options.blockLengthFilter === null}
                        />
                    </label>
                </section>

                <div className="timetable-options__actions">
                    <button
                        type="button"
                        className="timetable-options__button timetable-options__button--secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className="timetable-options__button timetable-options__button--primary"
                        onClick={() => {
                            onOptionsChange(options);
                            onClose();
                        }}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TimetableOptionsDialog;
