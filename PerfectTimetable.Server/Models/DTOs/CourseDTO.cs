using PerfectTimetable.Server.Models;

namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class CourseDTO
    {
        public string Name { get; set; } = default!;
        public int DurationMinutes { get; set; }
        public List<TimeSlotDto> Timeslots { get; set; } = [];

        public Course ToDomain(CourseModel model, out List<string> failedSlots)
        {
            failedSlots = [];
            List<TimeSlot> slots = [];
            int durationBlocks = TimeGridMath.DurationBlocks(DurationMinutes, model);
            Course course = new Course(Name, durationBlocks, slots, model);

            foreach (var slotDTO in Timeslots)
                try
                {
                    slots.Add(slotDTO.ToDomain(model, course));
                }
                catch (Exception ex)
                {
                    failedSlots.Add(ex.Message);

                }

            return course;
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
