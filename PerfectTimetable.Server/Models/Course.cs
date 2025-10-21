using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    // TODO: add validation for durationblocks and timeslots
    public class Course
    {
        public Course() { }
        public Course(string name, int durationBlocks, List<TimeSlot> timeslots)
        {
            Name = name;
            DurationBlocks = durationBlocks;
            Timeslots = timeslots;
        }

        public Course(Course course)
        {
            Name = course.Name;
            DurationBlocks = course.DurationBlocks;
            foreach (TimeSlot slot in course.Timeslots)
            {
               Timeslots.Add(new TimeSlot(slot));
            }
        }
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        // Duration in number of blocks for every timeslot
        [Required]
        public int DurationBlocks { get; set; }
        [Required]
        public List<TimeSlot> Timeslots { get; set; } = [];

    }
}
