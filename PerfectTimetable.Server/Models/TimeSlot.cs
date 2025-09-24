namespace PerfectTimetable.Server.Models
{
    public class TimeSlot
    {
        public int Day { get; set; }
        public int StartBlock { get; set; }
        public TimeSlot(int day, int startBlock)
        {
            Day = day;
            StartBlock = startBlock;
        }
    }
}