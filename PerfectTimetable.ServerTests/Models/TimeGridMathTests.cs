using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;
using System;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class TimeGridMathTests
{
    [TestMethod]
    public void DurationMinutesToBlocks_RoundsUp()
    {
        var model = new CourseModel
        {
            BlockDuration = TimeSpan.FromMinutes(30)
        };

        Assert.AreEqual(1, TimeGridMath.DurationBlocks(1, model));
        Assert.AreEqual(1, TimeGridMath.DurationBlocks(30, model));
        Assert.AreEqual(2, TimeGridMath.DurationBlocks(31, model));
        Assert.AreEqual(2, TimeGridMath.DurationBlocks(60, model));
        Assert.AreEqual(3, TimeGridMath.DurationBlocks(61, model));
    }

    [TestMethod]
    public void StartBlockFromTime_UsesFloor()
    {
        var model = new CourseModel
        {
            StartTime = TimeSpan.FromHours(8),
            BlockDuration = TimeSpan.FromMinutes(30),
            Blocks = 16
        };

        Assert.AreEqual(1, TimeGridMath.StartBlock(TimeSpan.FromHours(8), model));
        Assert.AreEqual(1, TimeGridMath.StartBlock(TimeSpan.FromHours(8) + TimeSpan.FromMinutes(1), model));
        Assert.AreEqual(2, TimeGridMath.StartBlock(TimeSpan.FromHours(8) + TimeSpan.FromMinutes(30), model));
        Assert.AreEqual(2, TimeGridMath.StartBlock(TimeSpan.FromHours(8) + TimeSpan.FromMinutes(31), model));
    }

    [TestMethod]
    public void NormalizeDurationBlocks_UsesCeiling()
    {
        var model = new CourseModel();
        var course = new Course("Test", durationBlocks: 2, timeslots: [], model);

        Assert.AreEqual(2, TimeGridMath.NormalizeDurationBlocks(course, TimeSpan.FromMinutes(30), TimeSpan.FromMinutes(40))); // 60 -> ceil(60/40)=2
        Assert.AreEqual(3, TimeGridMath.NormalizeDurationBlocks(course, TimeSpan.FromMinutes(40), TimeSpan.FromMinutes(30))); // 80 -> ceil(80/30)=3
    }

    [TestMethod]
    public void NormalizeStartBlock_UsesFloor()
    {
        var oldModel = new CourseModel
        {
            StartTime = TimeSpan.FromHours(8),
            BlockDuration = TimeSpan.FromMinutes(30),
            Blocks = 16
        };
        var sameModel = new CourseModel
        {
            StartTime = TimeSpan.FromHours(8),
            BlockDuration = TimeSpan.FromMinutes(30),
            Blocks = 16
        };
        var newModel = new CourseModel
        {
            StartTime = TimeSpan.FromHours(8),
            BlockDuration = TimeSpan.FromMinutes(40),
            Blocks = 16
        };

        Assert.AreEqual(1, TimeGridMath.NormalizeStartBlock(new TimeSlot(TimetableDay.Monday, 1), oldModel, sameModel));
        Assert.AreEqual(1, TimeGridMath.NormalizeStartBlock(new TimeSlot(TimetableDay.Monday, 2), oldModel, newModel)); // old time: 8:30 is within new block 1 (8:00-8:39)
    }
}
