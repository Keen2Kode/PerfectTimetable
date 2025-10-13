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

export function TimetableOptionsDialog({ open, oldOptions, onClose, onOptionsChange}: TimetableOptionsDialogProps) {
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
                            document.getElementById('save-selections-button')?.click();
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
                -10,
                10,
                5,
                slotDistance,
                'Spread out slots',
                'Closer slots',
                onDistanceChange,
            )}
            {renderSliderField(
                'different-day-slider',
                'Different day weight',
                -10,
                10,
                5,
                differentDay,
                'Spread out days',
                'Within same day',
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
            {blockLengthFilter !== null && (
                <label className="timetable-options__field">
                    <span>Max block length</span>
                    <input
                        type="number"
                        min={1}
                        max={12}
                        value={blockLengthFilter}
                        onChange={(event) => onBlockLengthChange(Number(event.target.value))}
                    />
                </label>
            )}
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
    const captionId = `${id}-caption`;

    return (
        <div className="timetable-options__slider-shell">
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="timetable-options__slider"
                aria-label={label}
                aria-describedby={captionId}
            />
            <div className="timetable-options__slider-caption" id={captionId}>
                <span>{lowerLabel}</span>
                <span>{upperLabel}</span>
            </div>
        </div>
    );
}
