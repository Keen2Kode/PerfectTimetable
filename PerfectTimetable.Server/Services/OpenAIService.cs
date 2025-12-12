using OpenAI;
using OpenAI.Chat;
using OpenAI.Responses;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Schema;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using System.Xml.Linq;

namespace PerfectTimetable.Server.Services
{
    public class OpenAIService
    {
        private ChatClient client;
        public OpenAIService() {    
            client = new(model: "gpt-4o", apiKey: "aa");
        }

        // grab image data
        // read openapi schema
        public async Task ImageToCourseData(IFormFile image)
        {
            if (!ValidImage(image)) 
                return;

            BinaryData imageBytes = BinaryData.FromStream(image.OpenReadStream());

            ChatMessage message =
                new UserChatMessage(
                ChatMessageContentPart.CreateTextPart("Extract a Course. Return JSON that matches the schema. "),
                ChatMessageContentPart.CreateImagePart(imageBytes, image.ContentType));

            //ChatCompletion completion = await client.CompleteChatAsync(message);

           

            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "course_schema",
                    jsonSchema: BinaryData.FromString(CourseSchema()),
                    jsonSchemaIsStrict: true),
                Temperature = 0
            };

            Console.WriteLine(CourseSchema());

            ChatCompletion completion = await client.CompleteChatAsync([message], options);

            Console.WriteLine(completion.Content[0].Text);

            //using JsonDocument structuredJson = JsonDocument.Parse(completion.Content[0].Text);

            //Console.WriteLine($"Final answer: {structuredJson.RootElement.GetProperty("final_answer")}");
            //Console.WriteLine("Reasoning steps:");

            //foreach (JsonElement stepElement in structuredJson.RootElement.GetProperty("steps").EnumerateArray())
            //{
            //    Console.WriteLine($"  - Explanation: {stepElement.GetProperty("explanation")}");
            //    Console.WriteLine($"    Output: {stepElement.GetProperty("output")}");
            //}
        }

        // TODO: better validation. use mimedetective?
        private bool ValidImage(IFormFile image) {
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
