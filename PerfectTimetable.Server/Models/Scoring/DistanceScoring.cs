using System.Runtime.CompilerServices;

namespace PerfectTimetable.Server.Models.Scoring
{
    public class DistanceScoring : IScoring
    {
        private readonly int _differentDayScore;
        private readonly int _slotDistanceMultiplier;
        public DistanceScoring(int differentDayScore = 8, int slotDistanceMultiplier = 2) { 
            _differentDayScore = differentDayScore;
            _slotDistanceMultiplier = slotDistanceMultiplier;
        }

        public int Score(Timetable timetable)
        {
            int score = 0;
            for (int i = 0; i < timetable.Slots.Count - 1; i++)
            {
                TimetableSlot slot1 = timetable.Slots[i];
                TimetableSlot slot2 = timetable.Slots[i + 1];

                if (slot1.Day != slot2.Day)
                {
                    score += _differentDayScore;
                }
                else
                {
                    int distance = slot2.Start - slot1.End;
                    if (distance < 0)
                        throw new ArgumentOutOfRangeException($"Slot not ordered correctly. " +
                            $"Slot 2 {slot2.Start}, {slot2.Day} is before " +
                            $"Slot 1 {slot1.Start}, {slot1.Day}");
                    score += distance * _slotDistanceMultiplier;
                }
            }
            return score;
        }
    }
}
