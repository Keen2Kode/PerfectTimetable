using System.Collections.Generic;
using System.Linq;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

internal static class ModelBuilder
{
    private static readonly CourseModel DefaultModel = new()
    {
        StartTime = TimeSpan.FromHours(8),
        Blocks = 8,
        BlockDuration = TimeSpan.FromMinutes(30),
        // End Time = 12:00:00
        Days = [
            TimetableDay.Monday,
            TimetableDay.Tuesday,
            TimetableDay.Wednesday,
            TimetableDay.Thursday,
            TimetableDay.Friday
        ]
    };

    public static CourseModel CreateDefaultModel()
    {
        return new CourseModel(DefaultModel);
    }

    public static CourseModel CreateDefaultModelWithCourse()
    {
        return new CourseModel(DefaultModel)
        {
            Courses = [new Course() {
                Id = 1,
                DurationBlocks = 4,
                Name = "Course 1"
            }]
        };
    }

    public static Course CreateCourse(CourseModel model, int durationBlocks, params (TimetableDay Day, int StartBlock)[] timeslots)
    {
        var slots = timeslots.Select(s => new TimeSlot(s.Day, s.StartBlock)).ToList();
        var nextId = model.Courses.Select(c => c.Id).DefaultIfEmpty(0).Max() + 1;
        var course = new Course($"Course{nextId}", durationBlocks, slots, model);
        model.Courses.Add(course);
        return course;
    }

    public static TimetableSlot CreateSlot(Course course, int timeslotIndex = 0)
    {
        return new TimetableSlot(course, course.Timeslots[timeslotIndex]);
    }

    public static CourseModel CreateModel(params Course[] courses)
    {
        var model = CreateDefaultModel();
        model.Courses = courses.Select(course => new Course(course)).ToList();
        return model;
    }
}
