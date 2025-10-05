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
import type { ModelView } from '../api/modelView';
import { TimetableSlotView } from '../api/timetableSlot';
import { anchor, buildDayStarts, parseMinutes, parseTime } from '../utils/timetableTime';
import './CourseTimetable.css';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);

const localizer = dayjsLocalizer(dayjs);

export type SlotEvent = { slot: TimetableSlotView; start: Date; end: Date };

export type MultiCourseTimetableProps = {
  modelView: ModelView;
  timetableSlots: TimetableSlotView[];
  calendarOverrideProps?: Partial<CalendarProps<SlotEvent>>;
};

export function MultiCourseTimetable({
  modelView,
  timetableSlots,
  calendarOverrideProps,
}: MultiCourseTimetableProps) {
  const model: CourseModel = modelView.toCourseModel();
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

    const events = timetableSlots.map((slot) => {
        const start = slot.StartDate(dayStarts, blockDuration);
        const end = slot.EndDate(dayStarts, blockDuration);
        return start && end ? { slot, start, end } : null;
    }).filter((event) => event != null);


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
    eventPropGetter: (event) => {
      const baseColour = modelView.colours.getColour(event.slot.course.id);
      const background = modelView.colours.getColourWithAlpha(event.slot.course.id, 0.65);
      return {
        className: 'course-timetable__selection',
        style: { backgroundColor: background, borderColor: baseColour },
      };
    },
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
