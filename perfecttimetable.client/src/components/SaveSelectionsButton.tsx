import { useMutation } from '@tanstack/react-query';
import type { Timetable as ApiTimetable} from '../api/models';
import { ModelView } from '../api/modelView';
import { generateTimetable } from '../api/timetableApi';
import type { TimetableOptions } from '../api/timetableOptions';

interface SaveSelectionsButtonProps {
    modelView: ModelView;
    options: TimetableOptions;
    onGenerate?: (timetables: ApiTimetable[]) => void;
}

export function SaveSelectionsButton({ modelView, options, onGenerate }: SaveSelectionsButtonProps) {
    const mutation = useMutation({
        mutationFn: async () => {
            return await generateTimetable({
                model: modelView.toCourseModel(),
                scoring: options.scoring,
                filter: options.filter,
            });
        },
        onSuccess: (data: ApiTimetable[]) => {
            onGenerate?.(data);
        },
    });

    const { isPending, isSuccess, isError, data, error } = mutation;

    const handleClick = () => {
        if (isPending) return;
        mutation.mutate();
    };

    let message: string | null = null;
    if (isSuccess && data) {
        const total = data.length;
        message = `Generated ${total} timetable${total === 1 ? '' : 's'}.`;
    } else if (isError) {
        message = error instanceof Error ? error.message : 'Failed to save selections.';
    }

    return (
        <div className="timetable__save-shell">
            <button
                id="save-selections-button"
                type="button"
                className="timetable__actions-button"
                onClick={handleClick}
                disabled={isPending}
            >
                {isPending ? 'Generating' : 'Generate Timetables'}
            </button>
            {message && (
                <p className={`timetable__save-message timetable__save-message--${isError ? 'error' : isSuccess ? 'success' : 'idle' }`}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default SaveSelectionsButton;
