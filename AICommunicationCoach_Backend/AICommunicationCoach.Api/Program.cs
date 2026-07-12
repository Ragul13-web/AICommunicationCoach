using AICommunicationCoach.Api.Configuration;
using AICommunicationCoach.Api.Services.Implementations;
using AICommunicationCoach.Api.Services.Interfaces;
using Serilog;

var configuration = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();

try
{
    Log.Information("Starting the AI Communication Coach API Host...");
    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();
    // Add services to the container.
    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    //builder.Services.AddOpenApi();
    builder.Services.Configure<GroqSettings>(
    builder.Configuration.GetSection(GroqSettings.SectionName));
    builder.Services.AddHttpClient<IGroqApiClient, GroqApiClient>();
    builder.Services.AddScoped<IGrammarAgent, GrammarAgent>();
    builder.Services.AddScoped<IPronunciationAgent, PronunciationAgent>();
    builder.Services.AddScoped<IVocabularyAgent, VocabularyAgent>();
    builder.Services.AddScoped<IFluencyAgent, FluencyAgent>();
    builder.Services.AddScoped<IOrchestratorService, OrchestratorService>();
    builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("https://ai-communication-coach-liard.vercel.app/", "http://localhost:5173") // Supports both CRA and Vite defaults
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Important for Server-Sent Events (SSE) streaming connections later
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "AI Communication Coach",
        Version = "v1",
        Description = "Multi-Agent English Coach Backend using Groq & .NET 8"
    });
}); 
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json",
            "Communcation Agent v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "5001";
app.Run($"http://0.0.0.0:{port}");
}
catch (Exception ex)
{
    Log.Fatal(ex, "The application host terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush(); // Ensure all log queues are written out before shutting down
}