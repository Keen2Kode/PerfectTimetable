// PerfectTimetable.Server/Controllers/TimetableController.cs
using System;
using System.Collections.Generic;
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
    public ActionResult<List<Timetable>> PostTimetable([FromBody] GenerateTimetableRequest request)
    {
        if (request?.Model is null)
        {
            return BadRequest("Model is required.");
        }

        var options = request.Options ?? TimetableOptions.Default;
        var scoring = CreateScoring(options.Scoring);
        var filters = CreateFilters(options.Filters);

        return new TimetableFactory(request.Model).GenerateTimetables([scoring], filters);
    }

    private static DistanceScoring CreateScoring(ScoringOptions? scoring)
    {
        if (scoring is null)
        {
            return new DistanceScoring();
        }

        var slotMultiplier = scoring.SlotSpacing switch
        {
            <= 0 => 4,
            1 => 3,
            2 => 2,
            3 => 1,
            _ => 0,
        };

        var dayScore = scoring.DayBalance switch
        {
            <= 0 => 12,
            1 => 10,
            2 => 8,
            3 => 6,
            _ => 4,
        };

        return new DistanceScoring(differentDayScore: dayScore, slotDistanceMultiplier: slotMultiplier);
    }

    private static IFilter[] CreateFilters(FilterOptions? filters)
    {
        if (filters?.BlockLength == true)
        {
            return [new BlockLengthFilter(6)];
        }

        return Array.Empty<IFilter>();
    }
}
