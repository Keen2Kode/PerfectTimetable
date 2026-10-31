using System.Text.Json;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.ServerTests.Models;

[TestClass]
public class CourseModelTests
{
    [TestMethod]
    public void Json_SerializesLimitsAndIgnoresSubmittedOverrides()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var model = JsonSerializer.Deserialize<CourseModel>(
            """{"maxCourses":1000000,"maxSlots":1000000}""", options)!;

        Assert.AreEqual(20, model.MaxCourses);
        Assert.AreEqual(30, model.MaxSlots);

        using var json = JsonDocument.Parse(JsonSerializer.Serialize(model, options));
        Assert.AreEqual(20, json.RootElement.GetProperty("maxCourses").GetInt32());
        Assert.AreEqual(30, json.RootElement.GetProperty("maxSlots").GetInt32());
    }
}
