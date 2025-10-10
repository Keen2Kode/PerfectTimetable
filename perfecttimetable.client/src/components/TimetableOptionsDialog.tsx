import { useEffect, useState } from 'react';
import { produce } from 'immer';
import type { TimetableOptions } from '../api/timetableOptions';
import './TimetableOptionsDialog.css';


type TimetableOptionsDialogProps = {
    open: boolean;
    oldOptions: TimetableOptions;
    onClose: () => void;
    onOptionsChange: (options: TimetableOptions) => void;
};


const normalizeOptions = (options: TimetableOptions): TimetableOptions => ({
    scoring: options.scoring ?? null,
    filter: options.filter ?? null,
});

export function TimetableOptionsDialog({ open, oldOptions, onClose, onOptionsChange }: TimetableOptionsDialogProps) {
    const [options, setOptions] = useState<TimetableOptions>(() => normalizeOptions(oldOptions));

    useEffect(() => {
        if (open) {
            setOptions(normalizeOptions(oldOptions));
        }
    }, [open, oldOptions]);

    if (!open) {
        return null;
    }

    const slotDistanceValue = options.scoring?.slotDistanceMultiplier ?? 0;
    const differentDayValue = options.scoring?.differentDayScore ?? 0;
    const blockLengthValue = options.filter?.maxBlockLength ?? null;

    const updateDistanceScore = (value: number) => {
        setOptions((previous) => produce(previous, (draft) => {
            (draft.scoring ??= {}).slotDistanceMultiplier = value;
        }));
    };

    const updateDifferentDayScore = (value: number) => {
        setOptions((previous) => produce(previous, (draft) => {
            (draft.scoring ??= {}).differentDayScore = value;
        }));
    };


    const updateBlockLength = (value: number | null) => {
        setOptions((previous) => produce(previous, (draft) => {
            draft.filter = value === null ? null : { maxBlockLength: value };
        }));
    };


    const toggleBlockLength = (checked: boolean) => {
        setOptions((previous) => produce(previous, (draft) => {
            draft.filter = checked
                ? { maxBlockLength: draft.filter?.maxBlockLength ?? 12 }
                : null;
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
                {renderScoringSection(slotDistanceValue, differentDayValue, updateDistanceScore, updateDifferentDayScore)}

                {renderFiltersSection(blockLengthValue, toggleBlockLength, updateBlockLength)}

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
    slotDistance: number,
    differentDay: number,
    onDistanceChange: (value: number) => void,
    onDifferentDayChange: (value: number) => void
) {
    return (
        <section className="timetable-options__section">
            <h2 className="timetable-options__heading">Scoring</h2>
            {renderSliderField(
                'slot-distance-slider',
                'Slot distance weight',
                0,
                10,
                1,
                slotDistance,
                'Lower spread',
                'Higher spread',
                onDistanceChange,
            )}
            {renderSliderField(
                'different-day-slider',
                'Different day weight',
                0,
                10,
                1,
                differentDay,
                'Lower priority',
                'Higher priority',
                onDifferentDayChange,
            )}

        </section>
    );
}

function renderFiltersSection(
    blockLengthFilter: number | null,
    onToggleBlockLength: (checked: boolean) => void,
    onBlockLengthChange: (value: number | null) => void
) {
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

function renderSliderField(
    id: string,
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    lowerLabel: string,
    upperLabel: string,
    onChange: (value: number) => void,
) {
    const labelId = `${id}-label`;
    const captionId = `${id}-caption`;

    return (
        <>
            <label
                className="timetable-options__slider-label"
                id={labelId}
                htmlFor={id}
            >
                {label}
            </label>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="timetable-options__slider"
                aria-labelledby={`${labelId} ${captionId}`}
            />
            <div className="timetable-options__slider-caption" id={captionId}>
                <span>{lowerLabel}</span>
                <span>{upperLabel}</span>
            </div>
        </>
    );
}
