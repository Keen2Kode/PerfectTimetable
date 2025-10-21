using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    public class TimeSlot
    {
        public TimeSlot() { }
        public TimeSlot(TimeSlot slot)
        {
            Day = slot.Day;
            StartBlock = slot.StartBlock; 
        }

        public TimeSlot(TimetableDay day, int startBlock)
        {
            Day = day;
            StartBlock = startBlock;
        }
        [Required]
        public TimetableDay Day { get; set; }

        [Required]
        public int StartBlock { get; set; }

        public bool Valid()
        {
            if (StartBlock < 1)
                return false;
            return true;
        }
    }
}