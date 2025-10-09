using PerfectTimetable.Server.Models.Filter;

namespace PerfectTimetable.Server.Models.DTOs;

public sealed class GenerateTimetableRequest
{
    public CourseModel Model { get; set; } = new();
    public Scoring.DistanceScoring? Scoring { get; set; } = null;
    public BlockLengthFilter? Filter { get; set; } = null;
}
