FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AICommunicationCoach.Api/AICommunicationCoach.Api.csproj", "AICommunicationCoach.Api/"]
RUN dotnet restore "AICommunicationCoach.Api/AICommunicationCoach.Api.csproj"
COPY . .
WORKDIR "/src/AICommunicationCoach.Api"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV PORT=8080
ENTRYPOINT ["dotnet", "AICommunicationCoach.Api.dll", "--urls", "http://0.0.0.0:8080"]