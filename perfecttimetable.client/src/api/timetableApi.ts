import axios from 'axios';
import type { CourseModel } from './models';
import type { TimetableOptions } from './timetableOptions';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);

export type GenerateTimetableRequest = {
    model: CourseModel;
    options: TimetableOptions;
};

export async function generateTimetable(request: GenerateTimetableRequest) {
    const response = await client.post('/timetable/generate', request);
    return response.data;
}

