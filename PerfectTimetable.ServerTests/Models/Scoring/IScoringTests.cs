using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.Scoring;

namespace PerfectTimetable.ServerTests.Models.Scoring;

[TestClass]
public class IScoringTests
{
    [TestMethod]
    public void Score_WithEmptyList_ReturnsSameListAndDoesNotInvokeScore()
    {
        var stub = new DelegateScoring(_ => throw new InvalidOperationException("Score should not be called."));
        IScoring scoring = stub;
        var timetables = new List<Timetable>();

        var result = scoring.Score(timetables);

        Assert.AreSame(timetables, result);
        Assert.AreEqual(0, stub.CallCount);
    }

    [TestMethod]
    public void Score_WithSingleTimetable_AssignsScoreAndReturnsSameList()
    {
        var stub = new DelegateScoring(_ => 42);
        IScoring scoring = stub;
        var timetable = new Timetable();
        var timetables = new List<Timetable> { timetable };

        var result = scoring.Score(timetables);

        Assert.AreSame(timetables, result);
        Assert.AreEqual(1, stub.CallCount);
        Assert.AreEqual(42, timetable.Score);
    }

    [TestMethod]
    public void Score_WithMultipleTimetables_SortsByAscendingScore()
    {
        var first = new Timetable();
        var second = new Timetable();
        var third = new Timetable();
        var scores = new Dictionary<Timetable, int>
        {
            [first] = 30,
            [second] = 10,
            [third] = 20
        };
        var stub = new DelegateScoring(t => scores[t]);
        IScoring scoring = stub;
        var timetables = new List<Timetable> { first, second, third };

        var result = scoring.Score(timetables);

        CollectionAssert.AreEqual(new List<Timetable> { second, third, first }, result);
        Assert.AreEqual(3, stub.CallCount);
        Assert.AreEqual(30, first.Score);
        Assert.AreEqual(10, second.Score);
        Assert.AreEqual(20, third.Score);
    }

    [TestMethod]
    public void Score_WithEqualScores_RetainsAllTimetables()
    {
        var first = new Timetable();
        var second = new Timetable();
        var stub = new DelegateScoring(_ => 5);
        IScoring scoring = stub;
        var timetables = new List<Timetable> { first, second };

        var result = scoring.Score(timetables);

        Assert.AreEqual(2, stub.CallCount);
        Assert.IsTrue(result.All(t => t.Score == 5));
        CollectionAssert.AreEquivalent(new List<Timetable> { first, second }, result);
    }

    private sealed class DelegateScoring : IScoring
    {
        private readonly Func<Timetable, int> _score;

        internal DelegateScoring(Func<Timetable, int> score)
        {
            _score = score;
        }

        internal int CallCount { get; private set; }

        public int Score(Timetable timetable)
        {
            CallCount++;
            return _score(timetable);
        }
    }
}