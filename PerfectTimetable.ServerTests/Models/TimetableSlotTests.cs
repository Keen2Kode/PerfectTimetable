using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class TimetableSlotTests
{
    [TestMethod]
    public void Constructor_ComputesDerivedProperties()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var course = ModelBuilder.CreateCourse(model, 2, (TimetableDay.Monday, 3));
        var timeSlot = course.Timeslots[0];

        var slot = new TimetableSlot(course, timeSlot);

        Assert.AreEqual(course, slot.Course);
        Assert.AreEqual(timeSlot, slot.TimeSlot);
        Assert.AreEqual(TimetableDay.Monday, slot.Day);
        Assert.AreEqual(3, slot.Start);
        Assert.AreEqual(5, slot.End);
    }

    [TestMethod]
    public void Equality_UsesValueComparison()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var course = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Tuesday, 4));
        var timeSlot = course.Timeslots[0];

        var first = new TimetableSlot(course, timeSlot);
        var second = new TimetableSlot(course, timeSlot);

        Assert.AreEqual(first, second);
        Assert.AreEqual(first.GetHashCode(), second.GetHashCode());
    }
}
