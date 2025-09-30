namespace PerfectTimetable.Server.Models
{
    public record TimetableSlot
    {
        public Course Course { get; }
        public TimeSlot TimeSlot { get; }
        public TimetableSlot(Course course, TimeSlot timeSlot)
        {
            Course = course;
            TimeSlot = timeSlot;
        }

        public TimetableDay Day => TimeSlot.Day;

        public int Start => TimeSlot.StartBlock;
        public int End => TimeSlot.StartBlock + Course.DurationBlocks;
    }
}