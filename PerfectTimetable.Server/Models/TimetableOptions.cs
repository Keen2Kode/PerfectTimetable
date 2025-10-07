namespace PerfectTimetable.Server.Models;

public sealed class TimetableOptions
{
    public ScoringOptions Scoring { get; init; } = new();

    public FilterOptions Filters { get; init; } = new();

    public static TimetableOptions Default => new();
}

public sealed class ScoringOptions
{
    public string Option { get; init; } = "slotDistance";

    public int SlotSpacing { get; init; } = 2;

    public int DayBalance { get; init; } = 2;
}

public sealed class FilterOptions
{
    public bool BlockLength { get; init; }
}
