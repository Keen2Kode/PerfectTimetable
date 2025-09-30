import axios from 'axios';
import type { CourseModel, TimeSlot } from './models';

const client = axios.create({
  baseURL: '/',
});

export const fetchTimetable = () =>
  client.get<CourseModel>('/timetable').then(({ data }) => data);

const postSelections = (payload: Record<number, TimeSlot[]>) =>
  client.post<void>('/selections', payload);

const getSelectionsSummary = () =>
  client.get<{ count?: number }>('/selections/summary').then(({ data }) => data);

export const saveSelectionsWithSummary = (payload: Record<number, TimeSlot[]>) =>
  postSelections(payload).then(() => getSelectionsSummary());
