import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { ModelView } from '../api/modelView'
import { applyModelOptions } from '../api/timetableApi'
import './ApplyModelOptionsButton.css'

interface ApplyModelOptionsButtonProps {
    modelView: ModelView
    startTime: string
    blockDuration: string
    blocks: number
    setView: (view: ModelView) => void
}

export function ApplyModelOptionsButton({
    modelView,
    startTime,
    blockDuration,
    blocks,
    setView,
}: ApplyModelOptionsButtonProps) {
    const { mutate, isPending } = useMutation({
        mutationFn: async (): Promise<string> => {
            const nextModel = await applyModelOptions({
                model: modelView.toCourseModel(),
                startTime,
                blockDuration,
                blocks,
            })
            setView(new ModelView(nextModel))
            return 'Schedule updated.'
        },
    })

    const handleClick = () => {
        if (isPending) {
            return
        }
        mutate(undefined, {
            onSuccess: (message) => {
                toast.success(message ?? 'Schedule updated.')
            },
            onError: (err) => {
                const text = err instanceof Error ? err.message : 'Failed to apply schedule.'
                toast.error(text)
            },
        })
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
        </div>
    )
}

export default ApplyModelOptionsButton
