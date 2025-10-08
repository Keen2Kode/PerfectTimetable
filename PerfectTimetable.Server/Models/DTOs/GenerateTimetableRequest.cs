using PerfectTimetable.Server.Models.Filter;

namespace PerfectTimetable.Server.Models.DTOs;

public sealed class GenerateTimetableRequest
{
    public CourseModel Model = new();
    public Scoring.DistanceScoring? Scoring = null;
    public BlockLengthFilter? Filter = null;
}
