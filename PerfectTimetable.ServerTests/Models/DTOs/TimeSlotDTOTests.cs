using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.DTOs;
using PerfectTimetable.ServerTests.Models;
using System.Reflection;

namespace PerfectTimetable.ServerTests;

[TestClass]
public class TimeSlotDTOTests
{

    [TestMethod]
    public void ToDomain_ValidDTO_ReturnsTimeSlot()
    {
        ReturnsTimeSlot("Monday", "08:00:00", TimetableDay.Monday, 1);
    }

    [TestMethod]
    public void ToDomain_ValidDTO_ReturnsTimeSlot2()
    {
        ReturnsTimeSlot("Monday", "08:29:59", TimetableDay.Monday, 1);
    }

    [TestMethod]
    public void ToDomain_ValidDTO_ReturnsTimeSlot3()
    {
        ReturnsTimeSlot("Monday", "08:30:00", TimetableDay.Monday, 2);
    }


    [TestMethod]
    public void ToDomain_DTOBeforeStartTime_ThrowsException()
    {
        ThrowsException<ArgumentOutOfRangeException>("Monday", "7:59:59");
    }

    [TestMethod]
    public void ToDomain_DTOAfterEndTime_ThrowsException()
    {
        // model end time is at 12:00:00
        ThrowsException<ArgumentOutOfRangeException>("Monday", "11:31:00");
    }


    private static void ReturnsTimeSlot(string day, string startTime, TimetableDay expectedDay, int expectedStartBlock)
    {
        TimeSlotDto slotDTO = new()
        {
            Day = day,
            StartTime = startTime
        };
        CourseModel model = ModelBuilder.CreateDefaultModelWithCourse();
        TimeSlot slot = slotDTO.ToDomain(model, model.Courses.First());
        Assert.AreEqual(expectedDay, slot.Day);
        Assert.AreEqual(expectedStartBlock, slot.StartBlock);
    }

    private static void ThrowsException<T>(string day, string startTime) where T : Exception
    {
        // model end time is at 12:00:00
        TimeSlotDto slotDTO = new()
        {
            Day = day,
            StartTime = startTime
        };

        CourseModel model = ModelBuilder.CreateDefaultModelWithCourse();
        Assert.ThrowsException<T>(() => slotDTO.ToDomain(model, model.Courses.First()));
    }


    [TestMethod]
    public void ToDomain_InvalidDay_ThrowsException()
    {
        ThrowsException<FormatException>("FrienDay", "08:00:00");
    }

    [TestMethod]
    public void ToDomain_DayOutsideRange_ThrowsException()
    {
        ThrowsException<ArgumentOutOfRangeException>("Wednesday", "08:00:00");
    }



}
