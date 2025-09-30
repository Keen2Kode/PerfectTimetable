
using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    public class TimetableFactory
    {
        private readonly CourseModel _model;
        private readonly List<TimetableSlot> slots;

        public TimetableFactory(CourseModel model)
        {
            this._model = model;
            slots = [
                .. from course in _model.Courses
                   from timeSlot in course.Timeslots
                   let s = new TimetableSlot(course, timeSlot)
                   // slots are non-decreasing in order
                   orderby s.Day, s.Start
                   select s
            ];
        }

        public List<Timetable> GenerateTimetables()
        {
            if (slots.Count == 0) {
                return [];
             }
            List<Timetable> timetables = [];
            GenerateTimetables(0, new Timetable());
            return timetables;

            void GenerateTimetables(int slotIndex, Timetable table)
            {
                if (table.AllCoursesIncluded(_model.Courses.Count))
                {
                    timetables.Add(new(table));
                    return;
                }
                if (slotIndex >= slots.Count)
                {
                    return;
                }

                TimetableSlot slot = slots[slotIndex];
                GenerateTimetables(slotIndex + 1, table);
                Timetable copy = new(table);
                if (copy.AddIfValid(slot))
                {
                    GenerateTimetables(slotIndex + 1, copy);
                }
                
            }

        }
    }
}
