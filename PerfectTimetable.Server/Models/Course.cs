namespace PerfectTimetable.Server.Models
{
    // TODO: add validation for durationblocks and timeslots
    public class Course(string name, int durationBlocks, List<TimeSlot> timeslots)
    {
        public int Id { get; set; }
        public string Name { get; set; } = name;

        // Duration in number of blocks for every timeslot
        public int DurationBlocks { get; set; } = durationBlocks;
        public List<TimeSlot> Timeslots { get; set; } = timeslots;

    }
}
