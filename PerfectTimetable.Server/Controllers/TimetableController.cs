// PerfectTimetable.Server/Controllers/TimetableController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.DTOs;
using PerfectTimetable.Server.Models.Filter;
using PerfectTimetable.Server.Models.Scoring;
using PerfectTimetable.Server.Services;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks.Dataflow;

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

    [Consumes("multipart/form-data")]
    [EndpointName("AICourseRequest")]
    public async Task<ActionResult<AICourseResponseDto>> GetCourse([FromForm] AICourseRequest courseRequest)
    {
        Console.WriteLine(courseRequest.Image.Name);
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        CourseModel model = JsonSerializer.Deserialize<CourseModel>(courseRequest.ModelJson, options) ?? throw new JsonException("JSON did not match course model.");

        return await aiService.ImageToCourseData(courseRequest.Image, model);
    }
}
