using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class TimetableTests
{
    [TestMethod]
    public void AddIfValid_AddsSlotAndUpdatesState()
    {
        var course = ModelBuilder.CreateCourse(1, 2, (TimetableDay.Monday, 0));
        var slot = new TimetableSlot(course, course.Timeslots[0]);
        var timetable = new Timetable();

        var added = timetable.AddIfValid(slot);

        Assert.IsTrue(added);
        Assert.AreEqual(slot, timetable.LastSlot);
        CollectionAssert.Contains(timetable.Slots, slot);
        Assert.IsTrue(timetable.CourseIds.Contains(course.Id));
    }

    [TestMethod]
    public void AddIfValid_NullSlot_ReturnsFalse()
    {
        var timetable = new Timetable();

        var added = timetable.AddIfValid(null!);

        Assert.IsFalse(added);
        Assert.AreEqual(0, timetable.Slots.Count);
        Assert.IsNull(timetable.LastSlot);
        Assert.AreEqual(0, timetable.CourseIds.Count);
    }

    [TestMethod]
    public void AddIfValid_RejectsOverlappingSlots()
    {
        var math = ModelBuilder.CreateCourse(2, 2, (TimetableDay.Tuesday, 1));
        var physics = ModelBuilder.CreateCourse(3, 1, (TimetableDay.Tuesday, 1));
        var firstSlot = new TimetableSlot(math, math.Timeslots[0]);
        var overlappingSlot = new TimetableSlot(physics, physics.Timeslots[0]);
        var timetable = new Timetable();

        Assert.IsTrue(timetable.AddIfValid(firstSlot));
        var added = timetable.AddIfValid(overlappingSlot);

        Assert.IsFalse(added);
        Assert.AreEqual(1, timetable.Slots.Count);
        Assert.AreEqual(firstSlot, timetable.LastSlot);
        Assert.IsFalse(timetable.CourseIds.Contains(physics.Id));
    }

    [TestMethod]
    public void AddIfValid_RejectsDuplicateCourses()
    {
        var course = ModelBuilder.CreateCourse(4, 1, (TimetableDay.Wednesday, 0), (TimetableDay.Thursday, 0));
        var firstSlot = new TimetableSlot(course, course.Timeslots[0]);
        var secondSlot = new TimetableSlot(course, course.Timeslots[1]);
        var timetable = new Timetable();

        Assert.IsTrue(timetable.AddIfValid(firstSlot));
        var added = timetable.AddIfValid(secondSlot);

        Assert.IsFalse(added);
        Assert.AreEqual(1, timetable.Slots.Count);
        Assert.AreEqual(firstSlot, timetable.LastSlot);
    }

    [TestMethod]
    public void AllCoursesIncluded_ReturnsExpectedResult()
    {
        var timetable = new Timetable
        {
            CourseIds = new HashSet<int> { 1, 2, 3 }
        };

        Assert.IsTrue(timetable.AllCoursesIncluded(3));
        Assert.IsFalse(timetable.AllCoursesIncluded(4));
    }
}
