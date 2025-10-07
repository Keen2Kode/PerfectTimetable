// PerfectTimetable.Server/Controllers/TimetableController.cs
using System.Text.Json;
using System.Threading.Tasks.Dataflow;
using Microsoft.AspNetCore.Mvc;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.Filter;
using PerfectTimetable.Server.Models.Scoring;

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

    // acts as both a post and a get to avoid 2 requests
    [HttpPost("generate")]
    public ActionResult<List<Timetable>> PostTimetable([FromBody] CourseModel model)
    {
        //var result = await _service.GenerateAsync(model);
        //IScoring scoring = new DistanceScoring();
        
        return new TimetableFactory(model).GenerateTimetables([new DistanceScoring()], new BlockLengthFilter(6));
    }
}

