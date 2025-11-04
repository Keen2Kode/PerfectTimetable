import axios, { AxiosError } from 'axios'
import type { CourseModel, GenerateTimetableRequest, ModelPropertiesRequest } from './models'

// Define the error shape your backend returns
export type ApiErrorResponse = string | { message?: string; title?: string }

const client = axios.create({ baseURL: '/timetable' })

client.interceptors.response.use(
    response => response,
    (error: AxiosError<ApiErrorResponse>) => {
        throw normalizeAxiosError(error)
    }
)


export const fetchTimetable = (signal?: AbortSignal) =>
  client.get<CourseModel>('/', { signal }).then(({ data }) => data)

export async function generateTimetable(request: GenerateTimetableRequest) {
    const response = await client.post('/generate', request)
    return response.data
}

export async function applyModelOptions(request: ModelPropertiesRequest) {
    const response = await client.post<CourseModel>('/applyModelOptions', request)
    return response.data
}

export async function uploadCourseScreenshot(file: File) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await client.post('/aiCourse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
}

function normalizeAxiosError(error: AxiosError<ApiErrorResponse> | unknown): Error {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const data = error.response?.data

        if (typeof data === 'string') {
            return new Error(data)
        }

        if (data && typeof data === 'object') {
            const msg = data.message ?? data.title
            if (typeof msg === 'string') {
                return new Error(msg)
            }
        }

        return new Error(error.message || 'Request failed.')
    }

    // Not an Axios error (e.g., thrown by other code)
    if (error instanceof Error) return error
    return new Error('An unexpected error occurred.')
}
