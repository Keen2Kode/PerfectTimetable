import { useState } from 'react';
import type { CourseModel} from '../api/models';
import { generateTimetable } from '../api/timetableApi';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SaveSelectionsButtonProps {
    model: CourseModel;
}

export function SaveSelectionsButton({ model}: SaveSelectionsButtonProps) {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleClick = () => {
        if (status === 'saving') return;

        setStatus('saving');
        setMessage(null);

        generateTimetable(model)
            .then((data) => {

                const summaryMessage =
                    typeof data?.count === 'number'
                        ? `Selections saved (${data.count} total slots).`
                        : 'Selections saved.';

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
                    {status === 'saving' ? 'Saving…' : 'Save Selections'}
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
