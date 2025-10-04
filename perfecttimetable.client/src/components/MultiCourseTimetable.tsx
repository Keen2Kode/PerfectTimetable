import { Calendar, Views, dayjsLocalizer, type CalendarProps, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import type { CourseModel } from '../api/models';
import { TimetableDay } from '../api/models';
import { TimetableSlot } from '../api/timetableSlot';
import { anchor, buildDayStarts, parseMinutes, parseTime } from '../utils/timetableTime';
import './CourseTimetable.css';
import { CourseView } from '../api/courseView';


dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);

const localizer = dayjsLocalizer(dayjs);

export type SlotEvent = { slot: TimetableSlot; start: Date; end: Date };

export type MultiCourseTimetableProps = {
  model: CourseModel;
  timetableSlots: TimetableSlot[];
  onSelectionChange?: (courseId: number, slots: TimetableSlot[]) => void;
  calendarOverrideProps?: Partial<CalendarProps<SlotEvent>>;
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

  const events: SlotEvent[] = timetableSlots
    .map((slot) => {
      const start = slot.StartDate(dayStarts, blockDuration);
      const end = slot.EndDate(dayStarts, blockDuration);
      return start && end ? { slot, start, end } : undefined;
    })
    .filter((event): event is SlotEvent => Boolean(event));

  //  const baseOnSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
  //      if (!onSelectionChange)
  //          return;
  //      const singleCourse = new CourseView(event.slot.course);
  //      onSelectionChange(singleCourse.id, singleCourse.toggleSlots([event.slot]));
    //};

    const baseOnSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
        if (!onSelectionChange) return;
        onSelectionChange(event.slot.course.id, toggleTimetableSlots(timetableSlots, [event.slot]));
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

function toggleTimetableSlots(current: TimetableSlot[], toggled: TimetableSlot[]): TimetableSlot[] {
  const map = new Map(current.map((slot) => [slot.key(), slot]));
  for (const slot of toggled) {
    const id = slot.key();
    if (map.has(id)) { map.delete(id); } else { map.set(id, slot); }
  }
  return [...map.values()];
}
