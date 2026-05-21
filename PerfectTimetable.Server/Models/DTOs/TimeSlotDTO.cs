namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class TimeSlotDto
    {
        public string Day { get; set; } = default!;       // "Monday"..."Sunday"
        public string StartTime { get; set; } = default!; // "HH:MM:SS"

        public TimeSlot ToDomain(CourseModel model, Course course)
        {

            if (!Enum.TryParse(Day, ignoreCase: true, out TimetableDay day))
                throw new FormatException($"{this} has an Invalid Day.");
            if (!model.Days.Contains(day))
                throw new ArgumentOutOfRangeException($"{this} has an Invalid Day.");

            // schema already enforces HH:MM:SS
            TimeSpan start = TimeSpan.Parse(StartTime);
            int startBlock = TimeGridMath.StartBlock(start, model);

            TimeSlot slot = new(day, startBlock);
            if (!TimeGridMath.Fits(slot, course, model))
                throw new ArgumentOutOfRangeException($"{this} is outside the course time range.");

            return new TimeSlot(day, startBlock);
        }

        public override string ToString()
        {
            return $"Timeslot on Day: {Day}, Start time: {StartTime}";
        }
    }
}
