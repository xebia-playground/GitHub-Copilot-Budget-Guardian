const core = require("@actions/core");

class Config {
  load() {
    return {
      githubToken: core.getInput("github-token", { required: true }),
      enterpriseSlug: core.getInput("enterprise-slug", { required: true }),
      budgetFile: core.getInput("budget-file", { required: true }),
      dryRun: core.getInput("dry-run") === "true",

      reportFormat: core.getInput("report-format") || "markdown",

      alertThreshold: Number(
        core.getInput("alert-threshold") || 80
      ),

      slackWebhook: core.getInput("slack-webhook") || "",

      teamsWebhook: core.getInput("teams-webhook") || ""
    };
  }
}

module.exports = new Config();