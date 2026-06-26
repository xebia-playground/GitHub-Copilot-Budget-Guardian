const logger = require("./logger");
const validator = require("./validator");
const reportService = require("./report-service");

class SyncService {
  async sync(budgets, githubClient) {
    logger.startGroup("Budget Synchronization");

    validator.validateBudgets(budgets);

    const result = {
      total: budgets.length,
      create: [],
      update: [],
      skip: [],
      errors: []
    };

    for (const budget of budgets) {
      try {
        // Placeholder until real GitHub Enterprise API is connected.
        // Next step will replace this section with actual API calls.

        result.skip.push(budget);

        logger.info(
          `SKIP -> ${budget.username} (${budget.budget})`
        );
      } catch (err) {
        result.errors.push({
          username: budget.username,
          message: err.message
        });

        logger.error(
          `${budget.username} : ${err.message}`
        );
      }
    }

    reportService.generate(budgets);

    logger.success("Synchronization completed.");

    logger.endGroup();

    return result;
  }
}

module.exports = new SyncService();