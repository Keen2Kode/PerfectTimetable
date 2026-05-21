using System;

namespace PerfectTimetable.Server.Models
{
    public static class TimeGridMath
    {
        public static int ToMinutes(TimeSpan time) => (int)time.TotalMinutes;

        public static TimeSpan EndTime(CourseModel model) => EndTime(model.StartTime, model.BlockDuration, model.Blocks);

        public static int DurationBlocks(int durationMinutes, CourseModel model)
            => DurationMinutesToBlocks(durationMinutes, model.BlockDuration);

        public static int StartBlock(TimeSpan slotStartTime, CourseModel model)
            => StartBlockFromTime(slotStartTime, model.StartTime, model.BlockDuration, model.Blocks);

        public static TimeSpan StartTime(CourseModel model, int startBlock)
            => StartTimeFromStartBlock(model.StartTime, model.BlockDuration, model.Blocks, startBlock);

        public static bool Fits(TimeSlot slot, Course course, CourseModel model)
            => Fits(slot.StartBlock, course.DurationBlocks, model.Blocks);

        public static (int SlotStartMinutes, int SlotEndMinutes) SlotTimeRangeMinutes(TimeSlot slot, Course course, CourseModel model)
            => SlotTimeRangeMinutes(model.StartTime, model.BlockDuration, model.Blocks, slot.StartBlock, course.DurationBlocks);

        public static int NormalizeDurationBlocks(Course course, TimeSpan oldBlockDuration, TimeSpan newBlockDuration)
            => NormalizeDurationBlocks(course.DurationBlocks, oldBlockDuration, newBlockDuration);

        public static int NormalizeStartBlock(TimeSlot slot, CourseModel oldModel, CourseModel newModel)
            => NormalizeStartBlock(slot.StartBlock, oldModel.StartTime, oldModel.BlockDuration, newModel.StartTime, newModel.BlockDuration, newModel.Blocks);

        public static bool TryNormalizeDurationBlocks(Course course, TimeSpan oldBlockDuration, TimeSpan newBlockDuration, out int durationBlocks)
        {
            try
            {
                durationBlocks = NormalizeDurationBlocks(course, oldBlockDuration, newBlockDuration);
                return true;
            }
            catch
            {
                durationBlocks = default;
                return false;
            }
        }

        public static bool TryNormalizeStartBlock(TimeSlot slot, CourseModel oldModel, CourseModel newModel, out int startBlock)
        {
            try
            {
                startBlock = NormalizeStartBlock(slot, oldModel, newModel);
                return true;
            }
            catch
            {
                startBlock = default;
                return false;
            }
        }

        public static double ConversionRate(TimeSpan oldBlockDuration, TimeSpan newBlockDuration)
        {
            int oldMinutes = ToMinutes(oldBlockDuration);
            int newMinutes = ToMinutes(newBlockDuration);
            return oldMinutes / (double)newMinutes;
        }

        public static int EndBlock(int startBlock, int durationBlocks)
        {
            if (startBlock < 1)
                throw new ArgumentOutOfRangeException(nameof(startBlock), "StartBlock must be at least 1.");
            if (durationBlocks < 1)
                throw new ArgumentOutOfRangeException(nameof(durationBlocks), "DurationBlocks must be at least 1.");

            return checked(startBlock + durationBlocks - 1);
        }

        private static bool Fits(int startBlock, int durationBlocks, int blocks)
        {
            return startBlock >= 1 && durationBlocks >= 1 && EndBlock(startBlock, durationBlocks) <= blocks;
        }

        private static TimeSpan EndTime(TimeSpan startTime, TimeSpan blockDuration, int blocks)
        {
            int minutesPerBlock = ToMinutes(blockDuration);
            return startTime + TimeSpan.FromMinutes(checked(minutesPerBlock * blocks));
        }

        private static int DurationMinutesToBlocks(int durationMinutes, TimeSpan blockDuration)
        {
            if (durationMinutes < 1)
                throw new ArgumentOutOfRangeException(nameof(durationMinutes), "DurationMinutes must be at least 1.");

            int minutesPerBlock = ToMinutes(blockDuration);
            return Math.Max(1, CeilDiv(durationMinutes, minutesPerBlock));
        }

        private static int StartBlockFromTime(TimeSpan slotStartTime, TimeSpan modelStartTime, TimeSpan blockDuration, int blocks)
        {
            int minutesPerBlock = ToMinutes(blockDuration);

            int deltaMinutes = checked(ToMinutes(slotStartTime) - ToMinutes(modelStartTime));
            if (deltaMinutes < 0)
                throw new ArgumentOutOfRangeException(nameof(slotStartTime), "Start time is before model start time.");

            // Map a time within a block to that block (e.g. 08:01 with 30-minute blocks starting at 08:00 => block 1).
            int index = deltaMinutes / minutesPerBlock; // 0 => block 1
            int startBlock = checked(1 + index);
            if (startBlock < 1 || startBlock > blocks)
                throw new ArgumentOutOfRangeException(nameof(slotStartTime), "Start time is outside the model range.");

            return startBlock;
        }

        private static TimeSpan StartTimeFromStartBlock(TimeSpan modelStartTime, TimeSpan blockDuration, int blocks, int startBlock)
        {
            int minutesPerBlock = ToMinutes(blockDuration);
            if (startBlock < 1 || startBlock > blocks)
                throw new ArgumentOutOfRangeException(nameof(startBlock), "StartBlock is outside the model range.");

            return modelStartTime + TimeSpan.FromMinutes(checked(minutesPerBlock * (startBlock - 1)));
        }

        private static (int SlotStartMinutes, int SlotEndMinutes) SlotTimeRangeMinutes(
            TimeSpan modelStartTime,
            TimeSpan blockDuration,
            int blocks,
            int startBlock,
            int durationBlocks)
        {
            int minutesPerBlock = ToMinutes(blockDuration);
            if (!Fits(startBlock, durationBlocks, blocks))
                throw new ArgumentOutOfRangeException(nameof(startBlock), "Slot is outside the model range.");

            int slotStartMinutes = checked(ToMinutes(modelStartTime) + (minutesPerBlock * (startBlock - 1)));
            int slotEndMinutes = checked(slotStartMinutes + (minutesPerBlock * durationBlocks));
            return (slotStartMinutes, slotEndMinutes);
        }

        private static int NormalizeDurationBlocks(int oldDurationBlocks, TimeSpan oldBlockDuration, TimeSpan newBlockDuration)
        {
            if (oldDurationBlocks < 1)
                throw new ArgumentOutOfRangeException(nameof(oldDurationBlocks), "DurationBlocks must be at least 1.");

            int oldMinutesPerBlock = ToMinutes(oldBlockDuration);
            int newMinutesPerBlock = ToMinutes(newBlockDuration);

            int totalMinutes = checked((int)oldDurationBlocks * oldMinutesPerBlock);
            return Math.Max(1, checked((int)CeilDiv(totalMinutes, newMinutesPerBlock)));
        }

        private static int NormalizeStartBlock(
            int oldStartBlock,
            TimeSpan oldModelStartTime,
            TimeSpan oldBlockDuration,
            TimeSpan newModelStartTime,
            TimeSpan newBlockDuration,
            int newBlocks)
        {
            if (oldStartBlock < 1)
                throw new ArgumentOutOfRangeException(nameof(oldStartBlock), "StartBlock must be at least 1.");

            int oldMinutesPerBlock = ToMinutes(oldBlockDuration);
            int newMinutesPerBlock = ToMinutes(newBlockDuration);

            int absoluteStartMinutes = checked((int)ToMinutes(oldModelStartTime) + ((int)(oldStartBlock - 1) * oldMinutesPerBlock));
            int deltaToNewStart = checked(absoluteStartMinutes - ToMinutes(newModelStartTime));
            if (deltaToNewStart < 0)
                throw new ArgumentOutOfRangeException(nameof(oldStartBlock), "Normalized StartBlock is outside the new model range.");

            int index = checked(deltaToNewStart / newMinutesPerBlock); // 0 => block 1
            int newStartBlock = checked(1 + index);
            if (newStartBlock < 1 || newStartBlock > newBlocks)
                throw new ArgumentOutOfRangeException(nameof(oldStartBlock), "Normalized StartBlock is outside the new model range.");

            return newStartBlock;
        }

        private static int CeilDiv(int numerator, int denominator)
        {
            return checked((numerator + denominator - 1) / denominator);
        }

    }
}
