// PerfectTimetable.Server/Controllers/TimetableController.cs
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks.Dataflow;
using Microsoft.AspNetCore.Mvc;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.DTOs;
using PerfectTimetable.Server.Models.Filter;
using PerfectTimetable.Server.Models.Scoring;
using PerfectTimetable.Server.Services;

namespace PerfectTimetable.Server.Controllers;

[ApiController]
[Route("timetable")]
public sealed class TimetableController(IWebHostEnvironment env) : ControllerBase
{
    public OpenAIService aiService = new();
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
        List<IScoring> scorers = [];
        List<IFilter> filters = [];

        if (request.Scoring != null)
                scorers.Add(request.Scoring);
        if (request.Filter != null)
            filters.Add(request.Filter);

        try
        {
            return new TimetableFactory(request.Model).GenerateTimetables(scorers, filters);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("applyModelOptions")]
    public ActionResult<CourseModel> ApplyModelOptions([FromBody] ModelPropertiesRequest modelRequest)
    {
        return modelRequest.Model.Normalize(
            modelRequest.StartTime, modelRequest.BlockDuration, modelRequest.Blocks);
    }

    [HttpPost("aiCourse")]
    public async void GetCourse(IFormFile image)
    {
        Console.WriteLine(image.Name);
        await aiService.ImageToCourseData(image);
        //return new Course();
    }

    [HttpPost("aiCourse2")]

    [Consumes("multipart/form-data")]
    public async Task<ActionResult<Course>> GetCourse([FromForm] AICourseRequest courseRequest)
    {
        CourseModel model = JsonSerializer.Deserialize<CourseModel>(courseRequest.ModelJson) ?? throw new JsonException("JSON did not match course model.");
        await aiService.ImageToCourseData(courseRequest.Image);
        return null;
    }
}
