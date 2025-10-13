
using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    public class Timetable
    {
        [Required]
        public List<TimetableSlot> Slots { get; set; } = [];
        [Required]
        public int Score { get; set; } = int.MinValue;
        internal HashSet<int> CourseIds { get; set; } = [];

        internal TimetableSlot LastSlot { get; set; }
        public Timetable(Timetable table)
        {
            CourseIds = [.. table.CourseIds];
            Slots = [.. table.Slots];
            LastSlot = table.LastSlot;
        }
        public Timetable() { }


        public bool Filter(Func<TimetableSlot, bool> filter)
        {
            foreach (TimetableSlot slot in Slots)
            {
                if (!filter(slot))
                    return false;
            }
            return true;
        }

        internal bool AddIfValid(TimetableSlot slot)
        {
            if (slot == null)
            {
                return false;
            }
            if (Overlap(slot))
                return false;
            if (RepeatingCourse(slot))
                return false;



            LastSlot = slot;
            CourseIds.Add(slot.Course.Id);
            Slots.Add(slot);
            return true; 

        }

        private bool Overlap(TimetableSlot slot)
        {
            if (LastSlot == null)
                return false;

            return slot.Day == LastSlot.Day && slot.Start < LastSlot.End;
        }
        private bool RepeatingCourse(TimetableSlot slot) => CourseIds.Contains(slot.Course.Id);
        internal bool AllCoursesIncluded(int courseCount)
        {
            return CourseIds.Count == courseCount;
        }

        
    }
}