using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    public class TimeSlot
    {
        [Required]
        public int Day { get; set; }

        [Required]
        public int StartBlock { get; set; }
        public TimeSlot(int day, int startBlock)
        {
            Day = day;
            StartBlock = startBlock;
        }
    }
}