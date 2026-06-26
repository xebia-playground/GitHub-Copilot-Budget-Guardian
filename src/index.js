const logger = require("./logger");
const budgetService = require("./budget-service");
const validator = require("./validator");
const reportService = require("./report-service");

async function run() {
  try {
    logger.startGroup("GitHub Copilot Budget Guardian");

    const budgets = budgetService.loadBudgets("budgets.csv");
    validator.validateBudgets(budgets);

    budgetService.printSummary(budgets);

    reportService.generate(budgets);

    logger.success("Budget file processed successfully.");

    logger.endGroup();
  } catch (err) {
    logger.fail(err);
  }
}

run();