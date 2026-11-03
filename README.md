# PerfectTimetable

readme instructions on how to inject the api key locally
I just used .NET's secrets file (give instructions for this)

## Run locally

Requires the .NET 9 SDK and Node.js 22. Run these commands from the repository root.

First-time setup:

```powershell
npm ci --prefix perfecttimetable.client
dotnet dev-certs https --trust
```

To enable AI course import, 
choose the `appsettings.json`'s AI `Model` and `Endpoint`, Store the API key in your environment variables - my way locally is using .NET user secrets:

```powershell
dotnet user-secrets set "AI:ApiKey" "YOUR_API_KEY" --project PerfectTimetable.Server
```

The rest of the app works without an API key.

Start the app:

```powershell
dotnet run --project PerfectTimetable.Server --launch-profile https
```

Open https://localhost:49935. The backend runs at https://localhost:7137 and automatically starts the Vite frontend.

## Development notes

After changing backend endpoints or models, start the app and run:

```powershell
npm run generate:api --prefix perfecttimetable.client
```

This downloads the latest OpenAPI schema and regenerates the files in `perfecttimetable.client/src/api/`, hence updating the frontend API client and TypeScript models using Orval.

## Configuration
You can change the AI `Model` and `Endpoint`, ensure you update the environment variable `AI:ApiKey` accordingly.
