namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class TimeSlotDto
    {
        public string Day { get; set; } = default!;       // "Monday"..."Sunday"
        public string StartTime { get; set; } = default!; // "HH:MM:SS"

        public TimeSlot ToDomain(CourseModel model, int durationBlocks)
        {

            if (!Enum.TryParse<TimetableDay>(Day, ignoreCase: true, out var day))
                throw new FormatException($"{this} has an Invalid Day.");

            // schema already enforces HH:MM:SS
            TimeSpan start = TimeSpan.Parse(StartTime);
            int startBlock = TimeGridMath.StartBlock(start, model);
            int endBlock = TimeGridMath.EndBlock(startBlock, durationBlocks);
            if (endBlock > model.Blocks)
                throw new ArgumentOutOfRangeException($"{this} is outside the course time range.");

            return new TimeSlot(day, startBlock);
        }

        public override string ToString()
        {
            return $"Timeslot on Day: {Day}, Start time: {StartTime}";
        }
    }
}
