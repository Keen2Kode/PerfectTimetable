using OpenAI;
using OpenAI.Chat;
using OpenAI.Responses;
using System.Reflection;

namespace PerfectTimetable.Server.Models.AI
{
    public class OpenAIService
    {
        private ChatClient client;
        public OpenAIService() {    
            client = new(model: "gpt-4o", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_KEY"));
        }

        public async Task TestResponseAsync()
        {
            ChatCompletion result = await client.CompleteChatAsync("Tell me your favourite thing about youself.");
            Console.WriteLine(result.Content[0].Text);
        }
    }
}
