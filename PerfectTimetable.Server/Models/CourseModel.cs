using System.ComponentModel.DataAnnotations;
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
            return TimeGridMath.EndTime(this);
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

            newModel.Courses.Clear();
            foreach (Course oldCourse in Courses)
            {
                Course? newCourse = NormalizeCourse(oldCourse, newModel);
                if (newCourse != null)
                    newModel.Courses.Add(newCourse);
            }
            return newModel;
        }

        private Course? NormalizeCourse(Course oldCourse, CourseModel newModel)
        {
            Course newCourse = new(oldCourse);

            if (!TimeGridMath.TryNormalizeDurationBlocks(newCourse, BlockDuration, newModel.BlockDuration, out int durationBlocks))
            {
                return null;
            }

            newCourse.DurationBlocks = durationBlocks;

            newCourse.Timeslots.Clear();
            foreach (TimeSlot oldSlot in oldCourse.Timeslots)
            {
                TimeSlot? newSlot = NormalizeTimeSlot(oldSlot, newModel, newCourse);
                if (newSlot != null)
                {
                    newCourse.Timeslots.Add(newSlot);
                }
            }
            return newCourse;
        }

        private TimeSlot? NormalizeTimeSlot(TimeSlot oldSlot, CourseModel newModel, Course newCourse)
        {
            // approximate old slot start+end times to new model
            if (!TimeGridMath.TryNormalizeStartBlock(oldSlot, this, newModel, out int startBlock))
                return null;

            TimeSlot newSlot = new(oldSlot)
            {
                StartBlock = startBlock
            };

            // new start time <= new slot start time, new slot end time <= new end time
            // TODO: fix if eg: 40 vs 30 minutes
            if (!TimeGridMath.Fits(newSlot, newCourse, newModel) && newCourse.CanAdd(newSlot))
            {
                return null;
            }
            return newSlot;
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
