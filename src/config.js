const core = require("@actions/core");

class Config {
  isGitHubActionsRuntime() {
    return process.env.GITHUB_ACTIONS === "true";
  }

  getLocalArg(name) {
    const flagName = `--${name}=`;
    const arg = process.argv.find((item) =>
      item.startsWith(flagName)
    );

    if (!arg) {
      return "";
    }

    return arg.slice(flagName.length);
  }

  getLocalOverride(name) {
    const envName = `COPILOT_BUDGET_GUARDIAN_${name
      .replace(/-/g, "_")
      .toUpperCase()}`;

    return (
      this.getLocalArg(name) ||
      process.env[envName] ||
      ""
    );
  }

  getInput(name, required = false, defaultValue = "") {
    if (!this.isGitHubActionsRuntime()) {
      const localValue = this.getLocalOverride(name);

      if (localValue) {
        return localValue;
      }

      if (required) {
        throw new Error(
          `Missing required input for local execution: ${name}`
        );
      }

      return defaultValue;
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
    const localDefaults = this.isGitHubActionsRuntime()
      ? {}
      : {
          githubToken: "local-dev-token",
          enterpriseSlug: "local-enterprise",
          budgetFile: "examples/budgets.csv",
          dryRun: "true",
          reportFormat: "markdown",
          alertThreshold: "80"
        };

    return {
      githubToken: this.getInput(
        "github-token",
        !localDefaults.githubToken,
        localDefaults.githubToken || ""
      ),

      enterpriseSlug: this.getInput(
        "enterprise-slug",
        !localDefaults.enterpriseSlug,
        localDefaults.enterpriseSlug || ""
      ),

      budgetFile: this.getInput(
        "budget-file",
        false,
        localDefaults.budgetFile || "budgets.csv"
      ),

      dryRun:
        this.getInput(
          "dry-run",
          false,
          localDefaults.dryRun || "false"
        ) ===
        "true",

      reportFormat: this.getInput(
        "report-format",
        false,
        localDefaults.reportFormat || "markdown"
      ),

      alertThreshold: Number(
        this.getInput(
          "alert-threshold",
          false,
          localDefaults.alertThreshold || "80"
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