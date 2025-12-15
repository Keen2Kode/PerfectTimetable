using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    public class TimeSlot : IEquatable<TimeSlot>
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
        [JsonRequired]
        public TimetableDay Day { get; set; }

        [Required]
        [JsonRequired]
        public int StartBlock { get; set; }


        public bool Valid()
        {
            if (StartBlock < 1)
                return false;
            return true;
        }




        public bool Equals(TimeSlot? other)
        {
            if (other is null) return false;
            if (ReferenceEquals(this, other)) return true;
            return Day == other.Day && StartBlock == other.StartBlock;
        }

        public override bool Equals(object? obj) => Equals(obj as TimeSlot);

        public override int GetHashCode() => HashCode.Combine(Day, StartBlock);

        public override string ToString()
        {
            return $"Timeslot on Day: {Day}, Start time: {StartBlock}";
        }
    }
}