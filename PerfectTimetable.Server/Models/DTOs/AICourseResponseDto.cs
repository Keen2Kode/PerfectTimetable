using PerfectTimetable.Server.Models;

namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed record AICourseResponseDto(Course Course, IReadOnlyList<string> FailedSlots);
}
