// PerfectTimetable.Server/Controllers/TimetableController.cs
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PerfectTimetable.Server.Models;

namespace PerfectTimetable.Server.Controllers;

[ApiController]
[Route("timetable")]
public sealed class TimetableController(IWebHostEnvironment env) : ControllerBase
{
    [HttpGet]
    public ActionResult<CourseModel> Get()
    {
        var filePath = Path.Combine(env.ContentRootPath, "Models", "database.json");
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound();
        }

        using var stream = System.IO.File.OpenRead(filePath);
        var model = JsonSerializer.Deserialize<CourseModel>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return model ?? new CourseModel();
    }

    [HttpPost("generate")]
    public void PostTimetable(CourseModel model)
    {
        Console.WriteLine("REACHED");
    }

    [HttpGet("generate")]
    public int? GenerateTimetable()
    {
        Console.WriteLine("REACHED get");
        return -1;
    }
}
