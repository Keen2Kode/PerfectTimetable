namespace PerfectTimetable.Server.Models.Filter
{
    public interface IFilter
    {

        public List<Timetable> Filter(List<Timetable> timetables)
        {
            IEnumerable<Timetable> filtered =
                from timetable in timetables
                where Filter(timetable)
                select timetable;
            return [..filtered];
        }
        bool Filter(Timetable timetable);
    }
}
