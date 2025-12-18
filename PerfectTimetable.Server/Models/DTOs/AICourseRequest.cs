using PerfectTimetable.Server.Models.Filter;
using System.ComponentModel.DataAnnotations;

namespace PerfectTimetable.Server.Models.DTOs
{
    public sealed class AICourseRequest
    {
        // when dealing with a multipart object, we have to use [FromForm]
        // that doesn't allow a nested object Model, so pass in as Json instead.
        [Required]
        public string ModelJson { get; set; } = default!;

        [Required]
        public IFormFile Image { get; set; } = default!;
    }
}
