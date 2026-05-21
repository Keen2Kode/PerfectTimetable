using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using PerfectTimetable.Server.Models;
using PerfectTimetable.Server.Models.DTOs;
using System.Text.Json;

namespace PerfectTimetable.Server.Services
{
    public class OpenAIService
    {
        private readonly ChatClient client;

        public OpenAIService(IConfiguration configuration)
        {
            // dotnet user-secrets set "OpenAI:ApiKey" "your-api-key-here" --project PerfectTimetable.Server
            // .NET has a special secrets file in %APPDATA%, similar to .env
            var apiKey = configuration["OpenAI:ApiKey"]
                ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("OpenAI API key is not configured. Set OpenAI__ApiKey or OPENAI_API_KEY.");
            }

            client = new(model: "gpt-4o", apiKey: apiKey);
        }

        // grab image data
        // read openapi schema
        public async Task<ActionResult<AICourseResponseDto>> ImageToCourseData(IFormFile image, CourseModel model)
        {
            if (!ValidImage(image))
                throw new ArgumentException("Image is not valid.");

            await using var stream = image.OpenReadStream();
            var imageBytes = await BinaryData.FromStreamAsync(stream);

            ChatMessage message =
                new UserChatMessage(
                ChatMessageContentPart.CreateTextPart("Extract a Course. Return JSON that matches the schema. "),
                ChatMessageContentPart.CreateImagePart(imageBytes, image.ContentType));




            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "course_schema",
                    jsonSchema: BinaryData.FromString(CourseSchema()),
                    jsonSchemaIsStrict: true),
                Temperature = 0
            };


            ChatCompletion completion = await client.CompleteChatAsync([message], options);

            Console.WriteLine(completion.Content[0].Text);
            Console.WriteLine(model);
            AICourseResponseDto result = ExtractCourse(completion, model);
            Console.WriteLine(result.Course);

            return result;
        }

        private static AICourseResponseDto ExtractCourse(ChatCompletion completion, CourseModel model)
        {
            JsonSerializerOptions serializerOptions = new()
            {
                PropertyNameCaseInsensitive = true
            };
            CourseDTO courseDTO = JsonSerializer.Deserialize<CourseDTO>(completion.Content[0].Text, serializerOptions) ?? throw new JsonException("JSON did not match CourseDTO.");
            Course course = courseDTO.ToDomain(model, out List<string> failedSlots);
            return new AICourseResponseDto(course, failedSlots);
        }

        // TODO: better validation. use mimedetective?
        private static bool ValidImage(IFormFile image) {
            string[] allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

            if (image == null || image.Length == 0)
                return false;
            if (!image.ContentType.Contains("image"))
                return false;
            string extension = Path.GetExtension(image.FileName).ToLower();
            
            if (string.IsNullOrEmpty(extension))
                return false;
            return allowedExtensions.Contains(extension);
        }

//#nullable enable
        //public readonly record struct CourseWrapper(Course Course);
        private static string CourseSchema()
        {
            //var options = new JsonSerializerOptions(JsonSerializerOptions.Default)
            //{
            //    // additional properties: false
            //    UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow 
            //};
            //var exporterOptions = new JsonSchemaExporterOptions
            //{
            //    TreatNullObliviousAsNonNullable = true
            //};
            //var schema = JsonSchemaExporter.GetJsonSchemaAsNode(options, typeof(Course), exporterOptions); // returns JsonNode
            //return schema.ToJsonString();

            // manually written as no support for custom properties like "format" etc. 
            return """
                                {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                   "Name": { "type": "string", "minLength": 1, "maxLength": 80 },
                    "DurationMinutes": {
                        "type": "integer",
                        "minimum": 0,
                        "description": "Total course duration expressed as whole minutes. Convert natural language durations (e.g., '2 hours 30 minutes') to total minutes (150)."
                    },

                    "Timeslots": {
                      "type": "array",
                      "description": "Include one item per row in the screenshot timetable. Do not omit any rows.",
                      "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                          "Day": {
                            "type": "string",
                            "enum": [
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday"
                            ]
                          },
                          "StartTime": {
                            "type": "string",
                            "pattern": "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
                            "description": "Output StartTime as HH:MM:SS (24-hour, zero-padded, no timezone/fractions)."
                          }
                        },
                        "required": ["Day", "StartTime"]
                      }
                    }
                  },
                  "required": ["Name", "DurationMinutes", "Timeslots"]
                }

                """;
        }
    }
}
