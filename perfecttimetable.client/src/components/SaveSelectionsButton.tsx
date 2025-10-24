import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Timetable as ApiTimetable } from '../api/models'
import { ModelView } from '../api/modelView'
import { generateTimetable } from '../api/timetableApi'
import type { TimetableOptions } from '../api/timetableOptions'

interface SaveSelectionsButtonProps {
    modelView: ModelView
    options: TimetableOptions
    onGenerate?: (timetables: ApiTimetable[]) => void
}

export function SaveSelectionsButton({ modelView, options, onGenerate }: SaveSelectionsButtonProps) {
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            return await generateTimetable({
                model: modelView.toCourseModel(),
                scoring: options.scoring,
                filter: options.filter,
            })
        },
        onSuccess: (data: ApiTimetable[]) => {
            const total = data.length
            toast.success(`Generated ${total} timetable${total === 1 ? '' : 's'}.`)
            onGenerate?.(data)
        },
        onError: (err: unknown) => {
            const text = err instanceof Error ? err.message : 'Failed to save selections.'
            toast.error(text)
        },
    })

    const handleClick = () => {
        if (isPending) return
        mutate()
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
        </div>
    )
}

export default SaveSelectionsButton
