import axios from 'axios';
import type { CourseModel} from './models';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);

const postSelections = (model: CourseModel) =>
  client.post<void>('/selections', model);

const getSelectionsSummary = () =>
  client.get<{ count?: number }>('/selections/summary').then(({ data }) => data);

export const saveSelectionsWithSummary = (model: CourseModel) =>
  postSelections(model).then(() => getSelectionsSummary());
