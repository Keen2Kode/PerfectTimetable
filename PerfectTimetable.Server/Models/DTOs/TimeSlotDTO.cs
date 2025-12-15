namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class TimeSlotDto
    {
        public string Day { get; set; } = default!;       // "Monday"..."Sunday"
        public string StartTime { get; set; } = default!; // "HH:MM:SS"

        public TimeSlot ToDomain(CourseModel model)
        {
            if (!Enum.TryParse<TimetableDay>(Day, ignoreCase: true, out var day))
                throw new FormatException($"{this} has an Invalid Day.");

            // schema already enforces HH:MM:SS
            TimeSpan start = TimeSpan.Parse(StartTime); 
            int startMinutes = (int)start.TotalMinutes;
            int modelStartMinutes = (int)model.StartTime.TotalMinutes;
            int modelBlockDuration = (int)model.BlockDuration.TotalMinutes;

            // eg: model start: 8:00 am (480), slot DTO start: 9:00am (540), block duration (30)
            // start block = 3
            // eg: if slot DTO start: 8:00am (480)
            // start block = 1
            int deltaMinutes = startMinutes - modelStartMinutes;
            int startBlock = 1 + (int)Math.Floor(deltaMinutes / (double)modelBlockDuration);

            // Optional: clamp/validate to model range
            if (startBlock < 1 || startBlock > model.Blocks)
                throw new ArgumentOutOfRangeException($"{this} has an invalid StartTime. '{StartTime}' maps to StartBlock {startBlock}, outside model range.");

            return new TimeSlot(day, startBlock);
        }

        public override string ToString()
        {
            return $"Timeslot on Day: {Day}, Start time: {StartTime}";
        }
    }
}
