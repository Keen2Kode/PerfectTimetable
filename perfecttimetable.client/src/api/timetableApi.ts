import axios from 'axios';
import type { CourseModel} from './models';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);

export async function generateTimetable(model: CourseModel) {
    const response = await client.post('/timetable/generate', model);
    console.log(response);
    return response.data;
}

