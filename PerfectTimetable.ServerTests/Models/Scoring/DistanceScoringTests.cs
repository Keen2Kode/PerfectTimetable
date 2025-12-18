using System.Collections.Generic;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.Scoring;
using PerfectTimetable.ServerTests.Models;

namespace PerfectTimetable.ServerTests.Models.Scoring;

[TestClass]
public class DistanceScoringTests
{
    [TestMethod]
    public void Score_WithNoSlots_ReturnsZero()
    {
        var scoring = new DistanceScoring();
        var timetable = new Timetable();

        var result = scoring.Score(timetable);

        Assert.AreEqual(0, result);
    }

    [TestMethod]
    public void Score_WithSingleSlot_ReturnsZero()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var course = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 0));
        var slot = ModelBuilder.CreateSlot(course);
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot> { slot }
        };
        var scoring = new DistanceScoring();

        var result = scoring.Score(timetable);

        Assert.AreEqual(0, result);
    }

    [TestMethod]
    public void Score_WithTouchingSameDaySlots_ReturnsZero()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var firstCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 0));
        var secondCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 1));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(firstCourse),
                ModelBuilder.CreateSlot(secondCourse)
            }
        };
        var scoring = new DistanceScoring();

        var result = scoring.Score(timetable);

        Assert.AreEqual(0, result);
    }

    [TestMethod]
    public void Score_WithSameDayGap_AccumulatesWeightedDistance()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var firstCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 0));
        var secondCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 3));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(firstCourse),
                ModelBuilder.CreateSlot(secondCourse)
            }
        };
        var scoring = new DistanceScoring();

        var result = scoring.Score(timetable);

        Assert.AreEqual(4, result);
    }

    [TestMethod]
    public void Score_WithDifferentDays_AddsDifferentDayScore()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var firstCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Thursday, 0));
        var secondCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Friday, 2));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(firstCourse),
                ModelBuilder.CreateSlot(secondCourse)
            }
        };
        var scoring = new DistanceScoring();

        var result = scoring.Score(timetable);

        Assert.AreEqual(8, result);
    }

    [TestMethod]
    public void Score_WithMixedSlots_SumsAcrossDaysAndGaps()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var firstCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 0));
        var secondCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Monday, 4));
        var thirdCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Tuesday, 2));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(firstCourse),
                ModelBuilder.CreateSlot(secondCourse),
                ModelBuilder.CreateSlot(thirdCourse)
            }
        };
        var scoring = new DistanceScoring();

        var result = scoring.Score(timetable);

        Assert.AreEqual(14, result);
    }

    [TestMethod]
    public void Score_WithUnorderedSlots_ThrowsException()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var laterCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 4));
        var earlierCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Wednesday, 0));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(laterCourse),
                ModelBuilder.CreateSlot(earlierCourse)
            }
        };
        var scoring = new DistanceScoring();

        Assert.ThrowsException<System.ArgumentOutOfRangeException>(() => scoring.Score(timetable));
    }

    [TestMethod]
    public void Score_WithCustomWeights_UsesProvidedValues()
    {
        var model = ModelBuilder.CreateDefaultModel();
        var firstCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Saturday, 0));
        var secondCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Saturday, 4));
        var thirdCourse = ModelBuilder.CreateCourse(model, 1, (TimetableDay.Sunday, 1));
        var timetable = new Timetable
        {
            Slots = new List<TimetableSlot>
            {
                ModelBuilder.CreateSlot(firstCourse),
                ModelBuilder.CreateSlot(secondCourse),
                ModelBuilder.CreateSlot(thirdCourse)
            }
        };
        var scoring = new DistanceScoring(DifferentDayScore: 10, SlotDistanceMultiplier: 5);

        var result = scoring.Score(timetable);

        Assert.AreEqual(25, result);
    }
}
