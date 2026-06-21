using AICommunicationCoach.Api.Models;
using AICommunicationCoach.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AICommunicationCoach.Api.Controller
{
    [ApiController]
    [Route("api/coach")]
    public class CoachController : ControllerBase
    {
        private readonly IOrchestratorService _orchestrator;
        private readonly ILogger<CoachController> _logger;

        public CoachController(IOrchestratorService orchestrator, ILogger<CoachController> logger)
        {
            _orchestrator = orchestrator;
            _logger = logger;
        }

        /// <summary>
        /// Analyze a piece of text (from speech transcript or typed input) and return
        /// merged feedback from all specialist agents plus an overall score.
        /// </summary>
        [HttpPost("analyze")]
        public async Task<ActionResult<CoachResponse>> Analyze(
            [FromBody] AnalyzeRequest request,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { error = "Text must not be empty." });
            }

            try
            {
                var result = await _orchestrator.ProcessAsync(request, ct);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process coaching request");
                return StatusCode(500, new { error = "Failed to analyze text. Please try again." });
            }
        }

        [HttpGet("health")]
        public IActionResult Health() => Ok(new { status = "ok" });
    }
}
