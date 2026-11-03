# TODOs

- [ ] Keep the debugger program path in [.vscode/launch.json](.vscode/launch.json)
  in sync with the backend target framework. It currently explicitly references
  `PerfectTimetable.Server/bin/Debug/net9.0/PerfectTimetable.Server.dll` and must
  be updated if `TargetFramework` changes in
  [PerfectTimetable.Server.csproj](PerfectTimetable.Server/PerfectTimetable.Server.csproj).
