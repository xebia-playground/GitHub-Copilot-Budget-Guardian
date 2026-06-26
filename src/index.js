const logger = require("./logger");
const budgetService = require("./budget-service");
const SyncService = require("./sync-service");
const GitHubClient = require("./github-client");

async function run() {
  try {
    logger.startGroup("GitHub Copilot Budget Guardian");

    const budgets = budgetService.loadBudgets("budgets.csv");

    const client = new GitHubClient(
      process.env.GITHUB_TOKEN || "dummy-token"
    );

    await SyncService.sync(budgets, client);


    logger.success("Budget file processed successfully.");

    logger.endGroup();
  } catch (err) {
    logger.fail(err);
  }
}

run();