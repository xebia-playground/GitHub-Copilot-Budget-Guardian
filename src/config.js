const core = require("@actions/core");

class Config {
  getInput(name, required = false, defaultValue = "") {
    const envName = `INPUT_${name.replace(/-/g, "_").toUpperCase()}`;

    const value =
      process.env[envName] ||
      process.env[name.replace(/-/g, "_").toUpperCase()];

    if (value) {
      return value;
    }

    try {
      return core.getInput(name, { required });
    } catch (_) {
      if (required) {
        throw new Error(`Missing required input: ${name}`);
      }

      return defaultValue;
    }
  }

  load() {
    return {
      githubToken: this.getInput("github-token", true),

      enterpriseSlug: this.getInput("enterprise-slug", true),

      budgetFile: this.getInput(
        "budget-file",
        false,
        "budgets.csv"
      ),

      dryRun:
        this.getInput("dry-run", false, "false") ===
        "true",

      reportFormat: this.getInput(
        "report-format",
        false,
        "markdown"
      ),

      alertThreshold: Number(
        this.getInput(
          "alert-threshold",
          false,
          "80"
        )
      ),

      slackWebhook: this.getInput(
        "slack-webhook"
      ),

      teamsWebhook: this.getInput(
        "teams-webhook"
      )
    };
  }
}

module.exports = new Config();