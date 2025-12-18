using PerfectTimetable.Server.Models.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    // TODO: add validation for durationblocks and timeslots
    public class Course
    {
        // JSON deserialization requires it
        public Course() { }
        public Course(string name, int durationBlocks, List<TimeSlot> timeslots, CourseModel model)
        {
            // TODO: migrate to EF core.
            Id = model.Courses.Select(c => c.Id).DefaultIfEmpty(0).Max() + 1;
            Name = name;
            DurationBlocks = durationBlocks;
            Timeslots = timeslots;
        }

        public Course(Course course)
        {
            Name = course.Name;
            DurationBlocks = course.DurationBlocks;
            Id = course.Id;
            foreach (TimeSlot slot in course.Timeslots)
            {
               Timeslots.Add(new TimeSlot(slot));
            }
        }
        [Required]
        [JsonRequired]
        public int Id { get; set; }

        [Required]
        [JsonRequired]
        public string Name { get; set; }

        // Duration in number of blocks for every timeslot
        [Required]
        [JsonRequired]
        public int DurationBlocks { get; set; }
        [Required]
        [JsonRequired]
        public List<TimeSlot> Timeslots { get; set; } = [];

        public bool CanAdd(TimeSlot timeslot)
        {
            return !Timeslots.Contains(timeslot);
        }

        public override string ToString()
        {
            string value = $"Course Name: {Name}, {DurationBlocks} blocks with {Timeslots.Count} slots.";
            foreach (TimeSlot slot in Timeslots)
            {
                value += "\n" + slot;
            }
            return value;
        }
    }
}
