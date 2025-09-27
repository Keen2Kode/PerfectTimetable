using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models
{
    // TODO: add validation for durationblocks and timeslots
    public class Course(string name, int durationBlocks, List<TimeSlot> timeslots)
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = name;

        // Duration in number of blocks for every timeslot
        [Required]
        public int DurationBlocks { get; set; } = durationBlocks;
       [Required]
        public List<TimeSlot> Timeslots { get; set; } = timeslots;

    }
}
