import type { Dispatch, SetStateAction } from 'react';
import type { CalendarProps } from 'react-big-calendar';
import type { ModelView } from '../api/modelView';
import type { CourseView } from '../api/courseView';
import { TimetableSlotView } from '../api/timetableSlot';
import { MultiCourseTimetable, type SlotEvent } from './MultiCourseTimetable';
import {toast} from 'react-toastify';

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

  const handleSelectSlot = (value: Date) => {
    const baseSlot = TimetableSlotView.parseTime(value, model, courseView);
    if (!baseSlot) return;

    const slots = courseView.getSlots();
    const isSelected = slots.some((slot) => slot.key() === baseSlot.key());

    if (!isSelected && slots.length >= modelView.maxSlots) {
      toast.error(`You can add up to ${modelView.maxSlots} slots per course.`, {
          toastId: `max-slots-${course.id}`,
      });
      return;
    }

    courseView.toggleSlots([baseSlot]);

    handleSlotsChange(courseView.getSlots());
  };

  const handleSelectEvent: CalendarProps<SlotEvent>['onSelectEvent'] = (event) => {
    if (event.slot.course.id !== course.id) return;
    courseView.toggleSlots([event.slot]);
    handleSlotsChange(courseView.getSlots());
  };

  const slotPropGetter: CalendarProps<SlotEvent>['slotPropGetter'] = (value) => {
    const disabled = TimetableSlotView.parseTime(value, model, courseView) == null;

    return {
      className: disabled ? 'course-timetable__slot--disabled' : undefined,
      style: disabled ? { pointerEvents: 'none' } : undefined,
      onClick: (event) => {
        // This getter also applies to time labels; only day cells select slots.
        if (!disabled && event.currentTarget.closest('.rbc-day-slot')) {
          handleSelectSlot(value);
        }
      },
    };
  };

  return (
    <MultiCourseTimetable
      modelView={modelView}
      timetableSlots={slots}
      calendarOverrideProps={{
        className: 'course-timetable--editable',
        // Override big-calendar's selection gestures: native clicks handle taps,
        // and the browser handles swipe scrolling.
        selectable: false,
        slotPropGetter,
        onSelectEvent: handleSelectEvent,
      }}
    />
  );
}

