const logger = require("./logger");
const config = require("./config");

async function run() {
  try {
    logger.startGroup("GitHub Copilot Budget Guardian");

    const cfg = config.load();

    logger.success("Configuration Loaded");

    logger.info(`Enterprise : ${cfg.enterpriseSlug}`);
    logger.info(`Budget File : ${cfg.budgetFile}`);
    logger.info(`Dry Run : ${cfg.dryRun}`);
    logger.info(`Report : ${cfg.reportFormat}`);
    logger.info(`Threshold : ${cfg.alertThreshold}%`);

    logger.endGroup();
  } catch (err) {
    logger.fail(err);
  }
}

run();