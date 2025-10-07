using System.Runtime.CompilerServices;

namespace PerfectTimetable.Server.Models.Filter
{
    public class BlockLengthFilter : IFilter
    {
        private readonly int _maxBlockLength;
        public BlockLengthFilter(int maxBlockLength) {
            _maxBlockLength = maxBlockLength;
        }

        public bool Filter(Timetable table)
        {
            List<TimetableSlot> slots = table.Slots;
            if (slots.Count == 0)
            {
                return true;
            }
            int length = slots[0].Course.DurationBlocks;
            for (int i= 1; i < slots.Count; i++)
            {
                bool connected = slots[i].Day == slots[i - 1].Day && slots[i].Start == slots[i - 1].End;
                if (connected)
                    length += slots[i].Course.DurationBlocks;
                else length = slots[i].Course.DurationBlocks;

                if (length > _maxBlockLength)
                    return false;
            }
            return true;

        } 
    }
}
