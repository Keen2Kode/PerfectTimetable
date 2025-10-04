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
    const parsed = TimetableSlot.parseTime(value, model, course);
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
    const baseSlot = TimetableSlot.parseTime(info.start, model, course);
    if (!baseSlot) return;
    onChange(courseView.toggleSlots([baseSlot]));
  };

  return (
    <MultiCourseTimetable
      model={model}
      timetableSlots={slots}
      onSelectionChange={(courseId, updated) => {
        if (courseId !== course.id) return;
        const next = courseView.setSlots(updated);
        onChange(next);
      }}
      calendarOverrideProps={{
        selectable: true,
        onSelectSlot: handleSelectSlot,
        components,
      }}
    />
  );
}
