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

To enable AI course import, store your API key using .NET user secrets:

```powershell
dotnet user-secrets set "OpenAIKey" "YOUR_API_KEY" --project PerfectTimetable.Server
```

The rest of the app works without an API key.

Start the app:

```powershell
dotnet run --project PerfectTimetable.Server --launch-profile https
```

Open https://localhost:49935. The backend runs at https://localhost:7137 and automatically starts the Vite frontend.
