using System.Collections.Generic;
using System.Linq;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

internal static class ModelBuilder
{
    public static Course CreateCourse(int id, int durationBlocks, params (TimetableDay Day, int StartBlock)[] timeslots)
    {
        var slots = timeslots.Select(s => new TimeSlot(s.Day, s.StartBlock)).ToList();
        var course = new Course($"Course{id}", durationBlocks, slots)
        {
            Id = id
        };
        return course;
    }

    public static TimetableSlot CreateSlot(Course course, int timeslotIndex = 0)
    {
        return new TimetableSlot(course, course.Timeslots[timeslotIndex]);
    }

    public static CourseModel CreateModel(params Course[] courses)
    {
        return new CourseModel
        {
            Courses = courses.ToList()
        };
    }
}
