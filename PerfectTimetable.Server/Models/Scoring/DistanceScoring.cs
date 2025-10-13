using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace PerfectTimetable.Server.Models.Scoring
{
    public class DistanceScoring : IScoring
    {
        [JsonInclude]
        private int DifferentDayScore  ;
        [JsonInclude]
        private int SlotDistanceMultiplier;

        [JsonConstructor]
        public DistanceScoring(int DifferentDayScore = 8, int SlotDistanceMultiplier = 2) { 
            this.DifferentDayScore = DifferentDayScore;
            this.SlotDistanceMultiplier = SlotDistanceMultiplier;
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
                    score += DifferentDayScore;
                }
                else
                {
                    int distance = slot2.Start - slot1.End;
                    if (distance < 0)
                        throw new ArgumentOutOfRangeException($"Slot not ordered correctly. " +
                            $"Slot 2 {slot2.Start}, {slot2.Day} is before " +
                            $"Slot 1 {slot1.Start}, {slot1.Day}");
                    score += distance * SlotDistanceMultiplier;
                }
            }
            return score;
        }
    }
}
