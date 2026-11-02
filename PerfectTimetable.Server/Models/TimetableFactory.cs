
using PerfectTimetable.Server.Models.Filter;
using PerfectTimetable.Server.Models.Scoring;
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

        public List<Timetable> GenerateTimetables(List<IScoring> scorers, List<IFilter> filters)
        {
            if (_model.Courses.Count == 0)
            {
                throw new ArgumentException($"No courses added.");
            }
            else if (_model.Courses.Count > _model.MaxCourses)
            {
                throw new ArgumentException($"Max {_model.MaxCourses} courses allowed.");
            }

            foreach(Course course in _model.Courses)
            {
                if (course.Timeslots.Count == 0)
                    throw new ArgumentException($"Course {course.Name} has no selected slots.");
                if (course.Timeslots.Count > _model.MaxSlots)
                    throw new ArgumentException($"Course {course.Name} crossed the max slots allowed ({_model.MaxSlots}).");
            }

            List<Timetable> timetables = [];
            GenerateTimetables(0, new Timetable());

            foreach (IFilter filter in filters)
            {
                timetables = filter.Filter(timetables);
            }

            foreach (IScoring scorer in scorers)
            {
                timetables = scorer.Score(timetables);
            }


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
