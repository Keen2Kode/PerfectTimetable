using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    public class TimeSlot
    {
        [Required]
        public TimetableDay Day { get; set; }

        [Required]
        public int StartBlock { get; set; }
        public TimeSlot(TimetableDay day, int startBlock)
        {
            Day = day;
            StartBlock = startBlock;
        }
    }
}