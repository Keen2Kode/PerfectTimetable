export type ScoringOption = 'slotDistance';

export type TimetableOptions = {
    scoring: {
        option: ScoringOption;
        slotSpacing: number;
        dayBalance: number;
    };
    filters: {
        blockLength: boolean;
    };
};

export const defaultTimetableOptions: TimetableOptions = {
    scoring: {
        option: 'slotDistance',
        slotSpacing: 2,
        dayBalance: 2,
    },
    filters: {
        blockLength: false,
    },
};
