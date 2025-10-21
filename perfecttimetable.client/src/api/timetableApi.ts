import axios from 'axios';
import type { CourseModel, GenerateTimetableRequest } from './models';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);


export async function generateTimetable(request: GenerateTimetableRequest) {
    const response = await client.post('/timetable/generate', request);
    return response.data;
}

//export async function applyModelOptions(request: ModelPropertiesRequest) {
//    const response = await client.post('/timetable/applyModelOptions', request);
//}
