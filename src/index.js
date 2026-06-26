const core = require("@actions/core");

async function run() {
    try {

        core.startGroup("🚀 GitHub Copilot Budget Guardian");

        const budgetFile = core.getInput("budget-file");
        const enterpriseSlug = core.getInput("enterprise-slug");
        const githubToken = core.getInput("github-token");
        const dryRun = core.getInput("dry-run");

        core.info("Configuration Loaded");

        core.info("--------------------------------");

        core.info(`Budget File      : ${budgetFile}`);
        core.info(`Enterprise Slug  : ${enterpriseSlug}`);
        core.info(`Dry Run          : ${dryRun}`);

        core.info("--------------------------------");

        if (!budgetFile) {
            throw new Error("Budget file is required.");
        }

        if (!enterpriseSlug) {
            throw new Error("Enterprise slug is required.");
        }

        if (!githubToken) {
            throw new Error("GitHub Token is required.");
        }

        core.notice("Configuration validation completed.");

        core.endGroup();

    } catch (error) {

        core.setFailed(error.message);

    }
}

run();