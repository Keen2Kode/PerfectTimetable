import { useEffect, useState } from 'react';
import { produce } from 'immer';
import './TimetableOptionsDialog.css';

type TimetableOptionsState = {
    distanceScore: number | null;
    differentDayScore: number | null;
    blockLengthFilter: number | null;
};

type TimetableOptionsDialogProps = {
    open: boolean;
    oldOptions: TimetableOptionsState;
    onClose: () => void;
    onOptionsChange: (options: TimetableOptionsState) => void;
};


const normalizeOptions = (options: TimetableOptionsState): TimetableOptionsState => ({
    distanceScore: options.distanceScore ?? null,
    differentDayScore: options.differentDayScore ?? null,
    blockLengthFilter: options.blockLengthFilter ?? null,
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
        setOptions((previous) => produce(previous, (draft) => {
            draft.distanceScore = value;
        }));
    };

    const updateDifferentDayScore = (value: number) => {
        setOptions((previous) => produce(previous, (draft) => {
            draft.differentDayScore = value;
        }));
    };


    const updateBlockLength = (value: number | null) => {
        setOptions((previous) => produce(previous, (draft) => {
            draft.blockLengthFilter = value;
        }));
    };


    const toggleBlockLength = (checked: boolean) => {
        setOptions((previous) => produce(previous, (draft) => {
            draft.blockLengthFilter = (checked ? (draft.blockLengthFilter ?? 12) : null);
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
                {renderScoringSection(options.distanceScore, options.differentDayScore, updateDistanceScore, updateDifferentDayScore)}

                {renderFiltersSection(options.blockLengthFilter, toggleBlockLength, updateBlockLength)}

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

function renderScoringSection(
    distanceScore: number | null,
    differentDayScore: number | null,
    onDistanceChange: (value: number) => void,
    onDifferentDayChange: (value: number) => void
) {
    return (
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
                value={distanceScore ?? 0}
                onChange={(event) => onDistanceChange(Number(event.target.value))}
                className="timetable-options__slider"
                aria-labelledby="slot-distance-label slot-distance-caption"
            />
            <div className="timetable-options__slider-caption" id="slot-distance-caption">
                <span>Lower spread</span>
                <span>Higher spread</span>
            </div>

            <label
                className="timetable-options__slider-label"
                id="different-day-label"
                htmlFor="different-day-slider"
            >
                Different day weight
            </label>
            <input
                id="different-day-slider"
                type="range"
                min={0}
                max={10}
                step={1}
                value={differentDayScore ?? 0}
                onChange={(event) => onDifferentDayChange(Number(event.target.value))}
                className="timetable-options__slider"
                aria-labelledby="different-day-label different-day-caption"
            />
            <div className="timetable-options__slider-caption" id="different-day-caption">
                <span>Lower priority</span>
                <span>Higher priority</span>
            </div>

        </section>
    );
}

function renderFiltersSection(blockLengthFilter: number | null,
    onToggleBlockLength: (checked: boolean) => void,
    onBlockLengthChange: (value: number | null) => void) {
    return (
        <section className="timetable-options__section">
            <h2 className="timetable-options__heading">Filters</h2>
            <label className="timetable-options__field">
                <input
                    type="checkbox"
                    checked={blockLengthFilter !== null}
                    onChange={(event) => {
                        onToggleBlockLength(event.target.checked);
                    }}
                />
                Block Length
            </label>
            <label className="timetable-options__field">
                <span>Max block length</span>
                <input
                    type="number"
                    min={1}
                    max={12}
                    value={blockLengthFilter ?? 12}
                    onChange={(event) => onBlockLengthChange(Number(event.target.value))}
                    disabled={blockLengthFilter === null}
                />
            </label>
        </section>
    );
}
