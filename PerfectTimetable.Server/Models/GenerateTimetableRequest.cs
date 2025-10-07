namespace PerfectTimetable.Server.Models;

public sealed class GenerateTimetableRequest
{
    public CourseModel Model { get; init; } = new();

    public TimetableOptions Options { get; init; } = TimetableOptions.Default;
}
