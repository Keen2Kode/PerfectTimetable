import { Calendar, Views, dayjsLocalizer, type CalendarProps, type SlotInfo, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

import type { Course, CourseModel } from '../api/models';
import { TimetableDay } from '../api/models';
import { TimetableSlot } from '../api/timetableSlot';
import { anchor, buildDayStarts, parseMinutes, parseTime } from '../utils/timetableTime';
import './CourseTimetable.css';
import type { ReactNode, ComponentType } from 'react';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);

const localizer = dayjsLocalizer(dayjs);

export type SlotEvent = { slot: TimetableSlot; start: Date; end: Date };

type MultiCourseTimetableProps = {
  model: CourseModel;
  timetableSlots: TimetableSlot[];
  onSelectionChange: (slots: TimetableSlot[]) => void;
  calendarOverrideProps?: Partial<CalendarProps<SlotEvent>>;
};
type SingleCourseTimetableProps = {
    model: CourseModel;
    timetableSlots: TimetableSlot[];
    onSelectionChange: (slots: TimetableSlot[]) => void;
    singleCourse: Course;
};



export function MultiCourseTimetable({
  model,
  timetableSlots,
  onSelectionChange,
  calendarOverrideProps,
}: MultiCourseTimetableProps) {
  const blockDuration = parseMinutes(model.blockDuration);
  const startTime = parseTime(model.startTime);
  const weekStart = dayjs().startOf('week');
  const dayStarts = buildDayStarts(model, weekStart, startTime);
  const view: View =
    model.days.every((day) => day !== TimetableDay.Saturday && day !== TimetableDay.Sunday)
      ? Views.WORK_WEEK
      : Views.WEEK;

  const anchorDate = anchor(startTime);
  const min = anchorDate.toDate();
  const max = anchorDate.add(blockDuration * model.blocks, 'minute').toDate();

  const events: SlotEvent[] = [];

  for (const slot of timetableSlots) {
    const start = slot.StartDate(dayStarts, blockDuration);
    const end = slot.EndDate(dayStarts, blockDuration);
    if (start && end) {
      events.push({ slot, start, end });
    }
  }

  const baseOnSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
    onSelectionChange(toggleTimetableSlots(timetableSlots, [event.slot]));
  };

  const baseProps: CalendarProps<SlotEvent> = {
    localizer,
    defaultDate: min,
    defaultView: view,
    views: [view],
    toolbar: false,
    selectable: false,
    events,
    step: blockDuration,
    timeslots: 1,
    min,
    max,
    onSelectEvent: baseOnSelectEvent,
    onSelecting: () => false,
    eventPropGetter: () => ({ className: 'course-timetable__selection' }),
    allDayAccessor: () => false,
    dayLayoutAlgorithm: 'no-overlap',
    longPressThreshold: 1,
  };

  return (
    <div className="course-timetable">
      <Calendar<SlotEvent>
        {...baseProps}
        {...calendarOverrideProps}
      />
    </div>
  );
}

function toggleTimetableSlots(current: TimetableSlot[], toggled: TimetableSlot[]) {
  const map = new Map(current.map((slot) => [slot.key(), slot]));
  for (const slot of toggled) {
    const id = slot.key();
    if (map.has(id)) map.delete(id);
    else map.set(id, slot);
  }
  return [...map.values()];
}

export function SingleCourseTimetable({
    model,
    timetableSlots,
    onSelectionChange,
    singleCourse,
}: SingleCourseTimetableProps) {
    const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
        const slot = TimetableSlot.parseTime(value, model, singleCourse);
        const disabled = slot == null;
        return (
            <div
                className={disabled ? 'course-timetable__slot--disabled' : undefined}
                style={disabled ? { pointerEvents: 'none' } : undefined}
            >
                {children}
            </div>
        );
    };

    const components = {
        timeSlotWrapper: slotWrapper as ComponentType,
        allDay: () => null,
    } as CalendarProps<SlotEvent>['components'];

    const newSlotClick = (info: SlotInfo) => {
        const baseSlot = TimetableSlot.parseTime(info.start, model, singleCourse);
        if (!baseSlot) return;
        onSelectionChange(toggleTimetableSlots(timetableSlots, [baseSlot]));
    };

    return (
        <MultiCourseTimetable
            model={model}
            timetableSlots={timetableSlots}
            onSelectionChange={onSelectionChange}
            calendarOverrideProps={{
                selectable: true,
                onSelectSlot: newSlotClick,
                components,
            }}
        />
    );
}