using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models
{
    public class CourseModel
    {
        [Required]
        public List<Course> Courses { get; set; } = [];

        [Required]
        public TimetableDay[] Days { get; set;  } = [
            TimetableDay.Monday,
            TimetableDay.Tuesday,
            TimetableDay.Wednesday,
            TimetableDay.Thursday,
            TimetableDay.Friday
        ];

        [Required]
        public TimeOnly StartTime { get; set; } = new TimeOnly(8,00); // 8 AM

        [Required]
        public TimeOnly BlockDuration { get; set; } = new TimeOnly(0,30); // 30 minutes
        // 30-minutes blocks beginning from the Start Time
        // eg: 16 blocks from StartTime at 8 AM means the last block ends at 4 PM

        [Required]
        public int Blocks { get; set; } = 16;


    }

    [JsonConverter(typeof(JsonStringEnumConverter<TimetableDay>))]
    public enum TimetableDay
    {
        Monday, Tuesday, Wednesday, Thursday,Friday, Saturday,Sunday
    }
}