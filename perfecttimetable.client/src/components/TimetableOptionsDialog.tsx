import { useEffect, useState } from 'react';
import './TimetableOptionsDialog.css';
import { type TimetableOptions } from '../api/timetableOptions';

type TimetableOptionsDialogProps = {
    open: boolean;
    oldOptions: TimetableOptions;
    onClose: () => void;
    onOptionsChange: (options: TimetableOptions) => void;
};

export function TimetableOptionsDialog({ open, oldOptions, onClose, onOptionsChange }: TimetableOptionsDialogProps) {
    const [options, setOptions] = useState<TimetableOptions>(oldOptions);

    useEffect(() => {
        if (open) {
            setOptions(oldOptions);
        }
    }, [open, oldOptions]);

    if (!open) {
        return null;
    }

    const updateScoring = (partial: Partial<TimetableOptions['scoring']>) => {
        setOptions((previous) => ({
            ...previous,
            scoring: { ...previous.scoring, ...partial },
        }));
    };

    const toggleFilter = (filter: keyof TimetableOptions['filters']) => {
        setOptions((previous) => ({
            ...previous,
            filters: {
                ...previous.filters,
                [filter]: !previous.filters[filter],
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
                            <label
                                className="timetable-options__slider-label"
                                id="slot-spacing-label"
                                htmlFor="slot-spacing-slider"
                            >
                                Slot spacing
                            </label>
                            <input
                                id="slot-spacing-slider"
                                type="range"
                                min={-10}
                                max={10}
                                step={5}
                                value={options.scoring.slotSpacing}
                                onChange={(event) => updateScoring({ slotSpacing: Number(event.target.value) })}
                                className="timetable-options__slider"
                                aria-labelledby="slot-spacing-label slot-spacing-caption"
                            />
                            <div className="timetable-options__slider-caption" id="slot-spacing-caption">
                                <span>Spread out slots</span>
                                <span>Packed slots</span>
                            </div>

                            <label
                                className="timetable-options__slider-label"
                                id="day-balance-label"
                                htmlFor="day-balance-slider"
                            >
                                Day balance
                            </label>
                            <input
                                id="day-balance-slider"
                                type="range"
                                min={-10}
                                max={10}
                                step={5}
                                value={options.scoring.dayBalance}
                                onChange={(event) => updateScoring({ dayBalance: Number(event.target.value) })}
                                className="timetable-options__slider"
                                aria-labelledby="day-balance-label day-balance-caption"
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
