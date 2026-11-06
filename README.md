![Perfectable banner](readme_assets/perfectable_banner_fade.png)

# Perfectable

Perfectable was built as a passion project to make it easy for University students heading into their next semester to create the "Perfect" Timetable preferences.

Click [here](https://perfect-timetable.up.railway.app/) to view the deployed app. 

I made this with 2 specific goals in mind:
1. **Simplify class selection:** Current class selection tables are confusing. I wanted to make them a lot more visually editable (with a little AI-assist!).

   ![Demo of visually editing timetable classes with AI assistance](readme_assets/timetable%20usecase%201.gif)

2. **Generate "Perfect" Timetables:** Simplify the hassle of comparing all class slot times to get the "Perfect" Timetable. Simply adjust your preferences and push a button. Want to cram all your classes in 1-2 days? No problem.

   ![Demo of generating a timetable from scheduling preferences](readme_assets/timetable%20usecase%202.gif)


## Developer Notes

### Running Locally

Requires the .NET 9 SDK and Node.js 22. Run these commands from the repository root.

First-time setup:

```powershell
npm ci --prefix perfecttimetable.client
dotnet dev-certs https --trust
```

Start the app:

```powershell
dotnet run --project PerfectTimetable.Server --launch-profile https
```

Find the **Network** URL in Vite's startup output, for example:

```text
Local:   https://localhost:49935/
Network: https://{IP}:49935/
```

For PC, open the Local URL.

For mobile devices, ensure the device is connected to the same Wi-Fi, and then open the Network URL.

### AI Configuration
To enable AI course import, 
choose the `appsettings.json`'s AI `Model` and `Endpoint`, store the API key in your environment variables - my way locally is using .NET user secrets:

```powershell
dotnet user-secrets set "AI:ApiKey" "YOUR_API_KEY" --project PerfectTimetable.Server
```

The rest of the app works without an API key.


### Refresh Frontend

After changing backend endpoints or models, start the app and run:

```powershell
npm run generate:api --prefix perfecttimetable.client
```

This downloads the latest OpenAPI schema and regenerates the files in `perfecttimetable.client/src/api/`, hence updating the frontend API client and TypeScript models using Orval.

