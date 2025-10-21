import { useMutation } from '@tanstack/react-query';

import { ModelView } from '../api/modelView';
import { applyModelOptions } from '../api/timetableApi';
import './ApplyModelOptionsButton.css';

interface ApplyModelOptionsButtonProps {
    modelView: ModelView;
    startTime: string;
    blockDuration: string;
    blocks: number;
    setView: (view: ModelView) => void;
}

export function ApplyModelOptionsButton({
    modelView,
    startTime,
    blockDuration,
    blocks,
    setView,
}: ApplyModelOptionsButtonProps) {
    const mutation = useMutation({
        mutationFn: async (): Promise<string> => {
            const nextModel = await applyModelOptions({
                model: modelView.toCourseModel(),
                startTime,
                blockDuration,
                blocks,
            });
            setView(new ModelView(nextModel));
            return 'Schedule updated.';
        },
    });

    const { mutate, isPending, isSuccess, isError, data, error, reset } = mutation;

    const handleClick = () => {
        if (isPending) {
            return;
        }
        if (isSuccess || isError) {
            reset();
        }
        mutate();
    };

    let message: string | null = null;
    if (isSuccess && data) {
        message = data;
    } else if (isError) {
        message = error instanceof Error ? error.message : 'Failed to apply schedule.';
    }

    return (
        <div className="timetable-schedule__apply">
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
            >
                {isPending ? 'Applying' : 'Apply'}
            </button>
            {message && (
                <p
                    className={`timetable-schedule__apply-message timetable-schedule__apply-message--${isError ? 'error' : 'success'}`}
                    role={isError ? 'alert' : 'status'}
                >
                    {message}
                </p>
            )}
        </div>
    );
}

export default ApplyModelOptionsButton;
