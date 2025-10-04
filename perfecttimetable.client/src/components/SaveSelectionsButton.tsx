import { useState } from 'react';
import type { Timetable as ApiTimetable } from '../api/models';
import { ModelView } from '../api/modelView';
import { generateTimetable } from '../api/timetableApi';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveSelectionsButtonProps {
    modelView: ModelView;
    onGenerate?: (timetables: ApiTimetable[]) => void;
}

export function SaveSelectionsButton({ modelView, onGenerate }: SaveSelectionsButtonProps) {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleClick = () => {
        if (status === 'saving') return;

        setStatus('saving');
        setMessage(null);

        const payload = modelView.toCourseModel();

        generateTimetable(payload)
            .then((data: ApiTimetable[]) => {
                onGenerate?.(data);

                const total = Array.isArray(data) ? data.length : undefined;
                const summaryMessage =
                    typeof total === 'number' ? `Generated ${total} timetable${total === 1 ? '' : 's'}.` : 'Selections saved.';

                setStatus('success');
                setMessage(summaryMessage);
            })
            .catch((error) => {
                const message =
                    error instanceof Error ? error.message : 'Failed to save selections.';
                setStatus('error');
                setMessage(message);
            })
            .finally(() => {
                setStatus((prev) => (prev === 'saving' ? 'idle' : prev));
            });
    };

    return (
        <>
            <div className="timetable__actions-row">
                <button
                    type="button"
                    className="timetable__actions-button"
                    onClick={handleClick}
                    disabled={status === 'saving'}
                >
                    {status === 'saving' ? 'Saving.' : 'Save Selections'}
                </button>
            </div>
            {message ? (
                <p className={`timetable__save-message timetable__save-message--${status}`}>
                    {message}
                </p>
            ) : null}
        </>
    );
}

export default SaveSelectionsButton;
