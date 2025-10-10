import type { BlockLengthFilter, DistanceScoring } from './models';

export type TimetableOptions = {
    scoring?: DistanceScoring;
    filter?: BlockLengthFilter;
};

export const defaultTimetableOptions: TimetableOptions = {
    scoring: {
        slotDistanceMultiplier: 2,
        differentDayScore: 2,
    },
    filter: null,
};
