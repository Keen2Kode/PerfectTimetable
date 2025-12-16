using PerfectTimetable.Server.Models;

namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class CourseDTO
    {
        public string Name { get; set; } = default!;
        public int DurationMinutes { get; set; }
        public List<TimeSlotDto> Timeslots { get; set; } = [];

        public Course ToDomain(CourseModel model)
        {
            int blockMinutes = (int)model.BlockDuration.TotalMinutes;

            // Round up so the course fits in the requested minutes
            int durationBlocks = (int)Math.Ceiling(DurationMinutes / (double)blockMinutes);

            List<TimeSlot> slots = [];
            foreach (var slotDTO in Timeslots)
            {
                try
                {
                    slots.Add(slotDTO.ToDomain(model));
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.Message);
                    // TODO: store and return them as a warning to the frontend.

                }
            }

            return new Course(Name, durationBlocks, slots, model);
        }

        public override string ToString()
        {
            string value = $"Course Name: {Name}, DurationMinutes: {DurationMinutes} with {Timeslots.Count} slots.";
            foreach (TimeSlotDto slotDTO in Timeslots)
            {
                value += "\n" + slotDTO;
            }
            return value;
        }
    }

    
}