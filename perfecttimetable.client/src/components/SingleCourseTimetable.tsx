import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react';
import type { CalendarProps, SlotInfo } from 'react-big-calendar';
import type { ModelView } from '../api/modelView';
import type { CourseView } from '../api/courseView';
import { TimetableSlotView } from '../api/timetableSlot';
import { MultiCourseTimetable, type SlotEvent } from './MultiCourseTimetable';

export type SingleCourseTimetableProps = {
  modelView: ModelView;
    courseView: CourseView;
    setView: Dispatch<SetStateAction<ModelView | null>>
};

export default function SingleCourseTimetable({ modelView, courseView, setView}: SingleCourseTimetableProps) {
  const model = modelView.toCourseModel();
  const course = courseView.toCourse();
    const slots = courseView.getSlots();

    const handleSlotsChange = (slots: TimetableSlotView[]) => {
        setView((previous) => previous?.withUpdatedCourse(course.id, slots) ?? null)
    };

  const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
    const parsed = TimetableSlotView.parseTime(value, model, courseView);
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
    const baseSlot = TimetableSlotView.parseTime(info.start, model, courseView);
    if (!baseSlot) return;
      courseView.toggleSlots([baseSlot]);

    handleSlotsChange(courseView.getSlots());
  };

  const handleSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
    if (event.slot.course.id !== course.id) return;
    courseView.toggleSlots([event.slot]);
    handleSlotsChange(courseView.getSlots());
  };

  return (
    <MultiCourseTimetable
      modelView={modelView}
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

