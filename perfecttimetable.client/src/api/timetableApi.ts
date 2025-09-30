import axios from 'axios';
import type { CourseModel} from './models';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);

const postSelections = (model: CourseModel) =>
  client.post<void>('/timetable/generate', model);

const getSelectionsSummary = () =>
  client.get<{ count?: number }>('/timetable/generate').then(({ data }) => data);

export const saveSelectionsWithSummary = (model: CourseModel) =>
  postSelections(model).then(() => getSelectionsSummary());
