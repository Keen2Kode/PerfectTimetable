using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class TimetableFactoryTests
{
    [TestMethod]
    public void GenerateTimetables_NoCourses_ReturnsEmpty()
    {
        var model = new CourseModel();
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables();

        Assert.AreEqual(0, timetables.Count);
        AssertValidTimetables(timetables, model.Courses.Select(c => c.Id));
    }

    [TestMethod]
    public void GenerateTimetables_SingleSlotPerCourse_ReturnsSingleTimetable()
    {
        var courseA = ModelBuilder.CreateCourse(1, 1, (TimetableDay.Monday, 0));
        var courseB = ModelBuilder.CreateCourse(2, 1, (TimetableDay.Monday, 1));
        var model = ModelBuilder.CreateModel(courseA, courseB);
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables();

        Assert.AreEqual(1, timetables.Count);
        var single = timetables[0];
        CollectionAssert.AreEquivalent(new[] { courseA.Id, courseB.Id }, single.CourseIds.ToList());
        Assert.AreEqual(2, single.Slots.Count);
        AssertValidTimetables(timetables, model.Courses.Select(c => c.Id));
    }

    [TestMethod]
    public void GenerateTimetables_FiltersOverlappingCombinations()
    {
        var courseA = ModelBuilder.CreateCourse(3, 2, (TimetableDay.Tuesday, 0));
        var courseB = ModelBuilder.CreateCourse(4, 1, (TimetableDay.Tuesday, 0), (TimetableDay.Tuesday, 2));
        var model = ModelBuilder.CreateModel(courseA, courseB);
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables();

        Assert.AreEqual(1, timetables.Count);
        var timetable = timetables[0];
        Assert.AreEqual(2, timetable.Slots.Count);
        Assert.IsTrue(timetable.Slots.Any(s => s.Course.Id == courseA.Id && s.Start == 0));
        Assert.IsTrue(timetable.Slots.Any(s => s.Course.Id == courseB.Id && s.Start == 2));
        Assert.IsFalse(timetable.Slots.Any(s => s.Course.Id == courseB.Id && s.Start == 0));
        AssertValidTimetables(timetables, model.Courses.Select(c => c.Id));
    }

    [TestMethod]
    public void GenerateTimetables_ReturnsIndependentCopies()
    {
        var courseA = ModelBuilder.CreateCourse(5, 1, (TimetableDay.Wednesday, 0), (TimetableDay.Thursday, 0));
        var courseB = ModelBuilder.CreateCourse(6, 1, (TimetableDay.Wednesday, 2), (TimetableDay.Thursday, 2));
        var model = ModelBuilder.CreateModel(courseA, courseB);
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables();

        Assert.AreEqual(4, timetables.Count);
        AssertValidTimetables(timetables, model.Courses.Select(c => c.Id));
        var first = timetables[0];
        var second = timetables[1];
        var secondSlotCount = second.Slots.Count;
        var secondCourseCount = second.CourseIds.Count;

        first.Slots.RemoveAt(0);
        first.CourseIds.Clear();

        Assert.AreEqual(secondSlotCount, second.Slots.Count);
        Assert.AreEqual(secondCourseCount, second.CourseIds.Count);
    }

    private static void AssertValidTimetables(IEnumerable<Timetable> timetables, IEnumerable<int> expectedCourseIds)
    {
        var expectedList = expectedCourseIds.ToList();
        foreach (var timetable in timetables)
        {
            CollectionAssert.AreEquivalent(expectedList, timetable.CourseIds.ToList());
            foreach (var dayGroup in timetable.Slots.GroupBy(s => s.Day))
            {
                var ordered = dayGroup.OrderBy(s => s.Start).ToList();
                for (int i = 1; i < ordered.Count; i++)
                {
                    Assert.IsTrue(ordered[i - 1].End <= ordered[i].Start,
                        $"Slots on {dayGroup.Key} overlap: {ordered[i - 1].End} > {ordered[i].Start}.");
                }
            }
        }
    }
}
