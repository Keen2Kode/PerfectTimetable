using PerfectTimetable.Server.Models.Filter;
using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models.DTOs;

public sealed class ModelPropertiesRequest
{
    [Required]
    public CourseModel Model { get; set; } = new();
    [Required]
    public TimeOnly StartTime { get; set; }
    [Required]
    public TimeOnly BlockDuration { get; set; }
    [Required]
    public int Blocks { get; set; }
}
