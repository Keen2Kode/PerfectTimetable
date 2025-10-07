import { useEffect, useState } from 'react';
import './TimetableOptionsDialog.css';

type ScoringOption = 'slotDistance';

export type TimetableOptions = {
    scoring: {
        option: ScoringOption;
        slotSpacing: number;
        dayBalance: number;
    };
    filters: {
        blockLength: boolean;
    };
};

type TimetableOptionsDialogProps = {
    open: boolean;
    onClose: () => void;
    onOptionsChange?: (options: TimetableOptions) => void;
};

const defaultOptions: TimetableOptions = {
    scoring: {
        option: 'slotDistance',
        slotSpacing: 2,
        dayBalance: 2,
    },
    filters: {
        blockLength: false,
    },
};

export function TimetableOptionsDialog({ open, onClose, onOptionsChange }: TimetableOptionsDialogProps) {
    const [options, setOptions] = useState<TimetableOptions>(defaultOptions);

    useEffect(() => {
        onOptionsChange?.(options);
    }, [options, onOptionsChange]);


    if (!open) {
        return null;
    }

    const updateScoring = (partial: Partial<TimetableOptions['scoring']>) => {
        setOptions((prev) => ({
            ...prev,
            scoring: { ...prev.scoring, ...partial },
        }));
    };

    const toggleFilter = (filter: keyof TimetableOptions['filters']) => {
        setOptions((prev) => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filter]: !prev.filters[filter],
            },
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
                <button
                    type="button"
                    className="timetable-options__close"
                    onClick={onClose}
                    aria-label="Close options"
                >
                    Close
                </button>

                <section className="timetable-options__section">
                    <h2 className="timetable-options__heading">Scoring</h2>
                    <label className="timetable-options__field">
                        <input
                            type="radio"
                            name="scoring-option"
                            value="slotDistance"
                            checked={options.scoring.option === 'slotDistance'}
                            onChange={() => updateScoring({ option: 'slotDistance' })}
                        />
                        Slot Distance
                    </label>

                    {options.scoring.option === 'slotDistance' && (
                        <>
                            <label className="timetable-options__slider-label" htmlFor="slot-spacing-slider">
                                Slot spacing
                            </label>
                            <input
                                id="slot-spacing-slider"
                                type="range"
                                min={0}
                                max={4}
                                step={1}
                                value={options.scoring.slotSpacing}
                                onChange={(event) => updateScoring({ slotSpacing: Number(event.target.value) })}
                                className="timetable-options__slider"
                                aria-describedby="slot-spacing-caption"
                            />
                            <div className="timetable-options__slider-caption" id="slot-spacing-caption">
                                <span>Spread out slots</span>
                                <span>Packed slots</span>
                            </div>

                            <label className="timetable-options__slider-label" htmlFor="day-balance-slider">
                                Day balance
                            </label>
                            <input
                                id="day-balance-slider"
                                type="range"
                                min={0}
                                max={4}
                                step={1}
                                value={options.scoring.dayBalance}
                                onChange={(event) => updateScoring({ dayBalance: Number(event.target.value) })}
                                className="timetable-options__slider"
                                aria-describedby="day-balance-caption"
                            />
                            <div className="timetable-options__slider-caption" id="day-balance-caption">
                                <span>More days</span>
                                <span>Less days</span>
                            </div>
                        </>
                    )}
                </section>

                <section className="timetable-options__section">
                    <h2 className="timetable-options__heading">Filters</h2>
                    <label className="timetable-options__field">
                        <input
                            type="checkbox"
                            checked={options.filters.blockLength}
                            onChange={() => toggleFilter('blockLength')}
                        />
                        Block Length
                    </label>
                </section>
            </div>
        </div>
    );
}

export default TimetableOptionsDialog;
