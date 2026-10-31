FROM node:22-bookworm-slim AS node
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

COPY --from=node /usr/local /usr/local

WORKDIR /src

COPY . .

RUN npm ci --prefix perfecttimetable.client

RUN dotnet publish PerfectTimetable.Server/PerfectTimetable.Server.csproj \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PerfectTimetable.Server.dll"]
