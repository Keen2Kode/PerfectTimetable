using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    public record TimetableSlot
    {
        [Required]
        public Course Course { get; set; }
        [Required]
        public TimeSlot TimeSlot { get;  set; }
        public TimetableSlot(Course course, TimeSlot timeSlot)
        {
            Course = course;
            TimeSlot = timeSlot;
            Day = timeSlot.Day;
            Start = timeSlot.StartBlock;
            End = timeSlot.StartBlock + course.DurationBlocks;
        }

        [Required]
        public TimetableDay Day;

        [Required]
        public int Start;
        [Required]
        public int End;
    }
}