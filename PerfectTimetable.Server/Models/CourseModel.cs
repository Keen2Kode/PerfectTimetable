namespace PerfectTimetable.Server.Models
{
    public class CourseModel
    {
        public List<Course> Courses { get; set; } = [];
        public DayOfWeek[] Days { get;} = [
            DayOfWeek.Monday, 
            DayOfWeek.Tuesday, 
            DayOfWeek.Wednesday, 
            DayOfWeek.Thursday, 
            DayOfWeek.Friday
        ];

        public TimeOnly StartTime { get; set; } = new TimeOnly(8,00); // 8 AM

        public TimeOnly BlockDuration { get; set; } = new TimeOnly(0,30); // 30 minutes
        // 30-minutes blocks beginning from the Start Time
        // eg: 16 blocks from StartTime at 8 AM means the last block ends at 4 PM

        public int Blocks { get; set; } = 16;


    }
}