namespace PerfectTimetable.Server.Models.Scoring
{
    public interface IScoring
    {

        public List<Timetable> Score(List<Timetable> timetables)
        {
            foreach (Timetable timetable in timetables)
            {
                timetable.Score = Score(timetable);
            }
            timetables.Sort((a, b) => a.Score.CompareTo(b.Score));
            return timetables;
        }
        int Score(Timetable timetable);
    }
}
