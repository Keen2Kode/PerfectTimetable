import axios from 'axios';
import type { CourseModel, GenerateTimetableRequest, ModelPropertiesRequest } from './models';

const client = axios.create({
    baseURL: '/timetable',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/').then(({ data }) => data);


export async function generateTimetable(request: GenerateTimetableRequest) {
    const response = await client.post('/generate', request);
    return response.data;
}

export async function applyModelOptions(request: ModelPropertiesRequest) {
    const response = await client.post<CourseModel>('/applyModelOptions', request);
    return response.data;
}
