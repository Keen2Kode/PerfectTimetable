//import type { ComponentType, ReactNode } from 'react';
//import type { CalendarProps, SlotInfo } from 'react-big-calendar';

//import type { Course, CourseModel } from '../api/models';
//import { TimetableSlot } from '../api/timetableSlot';
//import { MultiCourseTimetable, toggleTimetableSlots, type SlotEvent } from './MultiCourseTimetable';
//import './CourseTimetable.css';

//type SingleCourseTimetableProps = {
//  model: CourseModel;
//  timetableSlots: TimetableSlot[];
//  onSelectionChange: (slots: TimetableSlot[]) => void;
//  singleCourse: Course;
//};

//export function SingleCourseTimetable({
//  model,
//  timetableSlots,
//  onSelectionChange,
//  singleCourse,
//}: SingleCourseTimetableProps) {
//  const slotWrapper = ({ value, children }: { value: Date; children: ReactNode }) => {
//    const slot = TimetableSlot.parseTime(value, model, singleCourse);
//    const disabled = slot == null;
//    return (
//      <div
//        className={disabled ? 'course-timetable__slot--disabled' : undefined}
//        style={disabled ? { pointerEvents: 'none' } : undefined}
//      >
//        {children}
//      </div>
//    );
//  };

//  const components = {
//    timeSlotWrapper: slotWrapper as ComponentType,
//    allDay: () => null,
//  } as CalendarProps<SlotEvent>['components'];

//  const newSlotClick = (info: SlotInfo) => {
//    const baseSlot = TimetableSlot.parseTime(info.start, model, singleCourse);
//    if (!baseSlot) return;
//    onSelectionChange(toggleTimetableSlots(timetableSlots, [baseSlot]));
//  };

//  return (
//    <MultiCourseTimetable
//      model={model}
//      timetableSlots={timetableSlots}
//      onSelectionChange={onSelectionChange}
//      calendarOverrideProps={{
//        selectable: true,
//        onSelectSlot: newSlotClick,
//        components,
//      }}
//    />
//  );
//}