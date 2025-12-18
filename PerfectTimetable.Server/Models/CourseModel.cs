using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    public class CourseModel
    {
        public CourseModel() { }
        public CourseModel(CourseModel model)
        {
            BlockDuration = model.BlockDuration;
            Blocks = model.Blocks;
            Days = model.Days.ToArray();
            StartTime = model.StartTime;
            foreach (Course course in model.Courses)
            {
                Courses.Add(new Course(course));
            }
        }

        [Required]
        public List<Course> Courses { get; set; } = [];

        [Required]
        public TimetableDay[] Days { get; set; } = [
            TimetableDay.Monday,
            TimetableDay.Tuesday,
            TimetableDay.Wednesday,
            TimetableDay.Thursday,
            TimetableDay.Friday
        ];

        [Required]
        public TimeSpan StartTime { get; set; } = TimeSpan.FromHours(8); // 8 AM
        public TimeSpan EndTime()
        {
            return StartTime + TimeSpan.FromMinutes(ToMinutes(BlockDuration) * Blocks);
        }


        [Required]
        public TimeSpan BlockDuration { get; set; } = TimeSpan.FromMinutes(30); // 30 minutes
        // 30-minutes blocks beginning from the Start Time
        // eg: 16 blocks from StartTime at 8 AM means the last block ends at 4 PM

        [Required]
        public int Blocks { get; set; } = 16;


        public CourseModel Normalize(TimeSpan newStartTime, TimeSpan newBlockDuration, int newBlocks)
        {

            CourseModel newModel = new(this)
            {
                Blocks = newBlocks,
                BlockDuration = newBlockDuration,
                StartTime = newStartTime
            };

            double conversionRate = (double)ToMinutes(BlockDuration) / ToMinutes(newModel.BlockDuration);

            newModel.Courses.Clear();
            foreach (Course oldCourse in Courses)
            {
                Course newCourse = new(oldCourse);
                NormalizeCourse(newCourse, conversionRate);

                newCourse.Timeslots.Clear();
                foreach (TimeSlot oldSlot in oldCourse.Timeslots)
                {
                    // approximate old slot start+end times to new model
                    TimeSlot newSlot = new(oldSlot);
                    NormalizeSlot(conversionRate, oldSlot, newSlot, newModel, this);

                    // new start time <= new slot start time, new slot end time <= new end time
                    // TODO: fix if eg: 40 vs 30 minutes
                    if (SlotInRange(newCourse, newSlot, newModel) && newCourse.CanAdd(newSlot))
                    {
                        newCourse.Timeslots.Add(newSlot);
                    }
                }
                newModel.Courses.Add(newCourse);
            }
            return newModel;
        }

        private static void NormalizeSlot(
            double conversionRate,
            TimeSlot oldSlot,
            TimeSlot newSlot,
            CourseModel newModel,
            CourseModel oldModel)
        {

            double startTimeBlocks = (ToMinutes(oldModel.StartTime) - ToMinutes(newModel.StartTime)) / (double)ToMinutes(newModel.BlockDuration);
            double durationBlocks = (oldSlot.StartBlock - 1) * (double) conversionRate;

            newSlot.StartBlock = 1 + (int)Math.Ceiling(startTimeBlocks + durationBlocks);
        }


        private static void NormalizeCourse(Course course, double conversionRate)
        {
            course.DurationBlocks = (int) Math.Ceiling(course.DurationBlocks * conversionRate);
        }


        private static bool SlotInRange(Course course, TimeSlot slot, CourseModel model)
        {
            (int slotStartMinutes, int slotEndMinutes) = SlotTimeRange(slot, course, model);
            return slotStartMinutes >= ToMinutes(model.StartTime) && slotEndMinutes <= ToMinutes(model.EndTime());
        }











        private static int ToMinutes(TimeSpan time)
        {
            return (int)time.TotalMinutes;
        }


        private static (int, int) SlotTimeRange(TimeSlot slot, Course course, CourseModel model)
        {
            int slotStartMinutes = ToMinutes(model.StartTime) + (ToMinutes(model.BlockDuration) * (slot.StartBlock - 1));
            int slotEndMinutes = slotStartMinutes + (ToMinutes(model.BlockDuration) * course.DurationBlocks);
            return (slotStartMinutes, slotEndMinutes);
        }

        public override string ToString()
        {
            return $"Block duration: {BlockDuration}, Blocks: {Blocks}, StartTime: {StartTime}";
        }

    }

    [JsonConverter(typeof(JsonStringEnumConverter<TimetableDay>))]
    public enum TimetableDay
    {
        Monday, Tuesday, Wednesday, Thursday,Friday, Saturday,Sunday
    }

}
