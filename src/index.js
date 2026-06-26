const logger = require("./logger");
const config = require("./config");
const budgetService = require("./budget-service");
const SyncService = require("./sync-service");
const GitHubClient = require("./github-client");

async function run() {
  try {
    logger.startGroup("GitHub Copilot Budget Guardian");

    // Load configuration
    const cfg = config.load();

    // Read budget file
    const budgets = budgetService.loadBudgets(cfg.budgetFile);

    // Initialize GitHub client
    const client = new GitHubClient(cfg.githubToken);

    // Synchronize budgets
    await SyncService.sync(budgets, client, cfg);

    logger.success("Budget file processed successfully.");

    logger.endGroup();
  } catch (err) {
    logger.fail(err);
  }
}

run();