import type { ComponentType, ReactNode } from 'react';
import type { CalendarProps, SlotInfo } from 'react-big-calendar';
import type { ModelView } from '../api/modelView';
import type { CourseView } from '../api/courseView';
import { TimetableSlot } from '../api/timetableSlot';
import { MultiCourseTimetable, type SlotEvent } from './MultiCourseTimetable';

export type SingleCourseTimetableProps = {
  modelView: ModelView;
  courseView: CourseView;
  onChange: (slots: TimetableSlot[]) => void;
};

export default function SingleCourseTimetable({ modelView, courseView, onChange }: SingleCourseTimetableProps) {
  const model = modelView.toCourseModel();
  const course = courseView.toCourse();
  const slots = courseView.getSlots();

  const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
    const parsed = TimetableSlot.parseTime(value, model, courseView);
    const disabled = parsed == null;
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

  const handleSelectSlot = (info: SlotInfo) => {
    const baseSlot = TimetableSlot.parseTime(info.start, model, courseView);
    if (!baseSlot) return;
    courseView.toggleSlots([baseSlot]);
    onChange(courseView.getSlots());
  };

  const handleSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
    if (event.slot.course.id !== course.id) return;
    courseView.toggleSlots([event.slot]);
    onChange(courseView.getSlots());
  };

  return (
    <MultiCourseTimetable
      model={model}
      timetableSlots={slots}
      calendarOverrideProps={{
        selectable: true,
        onSelectSlot: handleSelectSlot,
        onSelectEvent: handleSelectEvent,
        components,
      }}
    />
  );
}
