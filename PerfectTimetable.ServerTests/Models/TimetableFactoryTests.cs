using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class TimetableFactoryTests
{
    [TestMethod]
    public void GenerateTimetables_NoCourses_ThrowsArgumentException()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var factory = new TimetableFactory(model);

        Assert.ThrowsException<System.ArgumentException>(() => factory.GenerateTimetables([], []));
    }

    [DataTestMethod]
    [DataRow(0)]
    [DataRow(1)]
    public void GenerateTimetables_CourseLimit_RejectsOnlyCountsAboveLimit(int extraCourses)
    {
        var model = ModelBuilder.CreateDefaultModel();
        for (var i = 0; i < model.MaxCourses + extraCourses; i++)
        {
            // Overlapping courses keep the search small at the allowed boundary.
            ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 1));
        }
        var factory = new TimetableFactory(model);

        if (extraCourses > 0)
        {
            Assert.ThrowsException<System.ArgumentException>(() => factory.GenerateTimetables([], []));
        }
        else
        {
            Assert.AreEqual(0, factory.GenerateTimetables([], []).Count);
        }
    }

    [DataTestMethod]
    [DataRow(0)]
    [DataRow(1)]
    public void GenerateTimetables_SlotLimit_RejectsOnlyCountsAboveLimit(int extraSlots)
    {
        var model = ModelBuilder.CreateDefaultModel();
        model.Blocks = model.MaxSlots + extraSlots;
        var timeslots = Enumerable.Range(1, model.MaxSlots + extraSlots)
            .Select(block => (TimetableDay.Monday, block))
            .ToArray();
        ModelBuilder.CreateCourse(model, 1, timeslots);
        var factory = new TimetableFactory(model);

        if (extraSlots > 0)
        {
            Assert.ThrowsException<System.ArgumentException>(() => factory.GenerateTimetables([], []));
        }
        else
        {
            Assert.AreEqual(model.MaxSlots, factory.GenerateTimetables([], []).Count);
        }
    }

    [TestMethod]
    public void GenerateTimetables_SingleSlotPerCourse_ReturnsSingleTimetable()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var courseA = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 0));
        var courseB = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 1));
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables([], []);

        Assert.AreEqual(1, timetables.Count);
        var single = timetables[0];
        CollectionAssert.AreEquivalent(new[] { courseA.Id, courseB.Id }, single.CourseIds.ToList());
        Assert.AreEqual(2, single.Slots.Count);
        AssertValidTimetables(timetables, model.Courses.Select(c => c.Id));
    }

    [TestMethod]
    public void GenerateTimetables_FiltersOverlappingCombinations()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var courseA = ModelBuilder.CreateCourse(model, 2, (TimetableDay.Tuesday, 0));
        var courseB = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Tuesday, 0), (TimetableDay.Tuesday, 2));
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables([], []);

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
        var model = ModelBuilder.CreateDefaultModel();
        var courseA = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 0), (TimetableDay.Thursday, 0));
        var courseB = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 2), (TimetableDay.Thursday, 2));
        var factory = new TimetableFactory(model);

        var timetables = factory.GenerateTimetables([], []);

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
