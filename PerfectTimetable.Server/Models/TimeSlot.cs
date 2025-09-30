using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    public class TimeSlot(TimetableDay day, int startBlock)
    {
        [Required]
        public TimetableDay Day { get; set; } = day;

        [Required]
        public int StartBlock { get; set; } = startBlock;

    }
}