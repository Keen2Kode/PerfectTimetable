using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PerfectTimetable.Server.Models.Filter;

namespace PerfectTimetable.Server.Models.DTOs;

public sealed class ModelPropertiesRequest
{
    [Required]
    public CourseModel Model { get; set; } = new();

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan BlockDuration { get; set; }

    [Required]
    public int Blocks { get; set; }
}
