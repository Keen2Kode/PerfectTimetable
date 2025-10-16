using PerfectTimetable.Server.Models.Filter;
using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models.DTOs;

public sealed class GenerateTimetableRequest
{
    [Required]
    public CourseModel Model { get; set; } = new();
    public Scoring.DistanceScoring? Scoring { get; set; } = null;
    public BlockLengthFilter? Filter { get; set; } = null;
}
