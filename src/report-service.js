const fs = require("fs");
const path = require("path");
const logger = require("./logger");

/**
 * Quotes a value for safe inclusion in a CSV field.
 * Wraps in double quotes and escapes any internal double quotes.
 * Also neutralizes spreadsheet formula execution when a value starts
 * with a formula trigger character (=, +, -, @).
 *
 * @param {*} value - Raw field value
 * @returns {string} Quoted CSV field
 */
function csvField(value) {
  let str = String(value ?? "");

  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ");
}

class ReportService {
  /**
   * Generates budget-report.md, budget-report.csv, and budget-report.json
   * under the artifacts/ directory.
   *
   * @param {Array<object>} budgets - Array of budget records from the CSV file
   * @param {object} [result={}] - Sync result containing created, updated, skipped, failed arrays
   * @returns {void}
   */
  generate(budgets, result = {}) {
    const artifactDir = "artifacts";
    fs.mkdirSync(artifactDir, { recursive: true });

    const summary = {
      total: budgets.length,
      created: result.created?.length || 0,
      updated: result.updated?.length || 0,
      skipped: result.skipped?.length || 0,
      failed: result.failed?.length || 0,
      generated: new Date().toISOString()
    };

    // Markdown Report
    const markdown = `# GitHub Copilot Budget Guardian Report

## Summary

| Metric | Count |
|--------|------:|
| Total Budgets | ${summary.total} |
| Created | ${summary.created} |
| Updated | ${summary.updated} |
| Skipped | ${summary.skipped} |
| Failed | ${summary.failed} |
| Generated | ${summary.generated} |

## Budget Details

| Username | Budget | Team | Reason |
|----------|-------:|------|--------|
${budgets
  .map(
    (u) =>
      `| ${u.username} | ${u.budget} | ${u.team} | ${u.reason} |`
  )
  .join("\n")}
`;

    fs.writeFileSync(path.join(artifactDir, "budget-report.md"), markdown);

    // JSON Report
    fs.writeFileSync(
      path.join(artifactDir, "budget-report.json"),
      JSON.stringify(
        {
          summary,
          budgets
        },
        null,
        2
      )
    );

    // CSV Report
    let csv = "username,budget,team,reason\n";

    budgets.forEach((u) => {
      csv += `${csvField(u.username)},${csvField(u.budget)},${csvField(u.team)},${csvField(u.reason)}\n`;
    });

    fs.writeFileSync(
      path.join(artifactDir, "budget-report.csv"),
      csv
    );

    logger.success("artifacts/budget-report.md generated.");
    logger.success("artifacts/budget-report.json generated.");
    logger.success("artifacts/budget-report.csv generated.");
  }

  /**
   * Writes a professional GitHub Job Summary to GITHUB_STEP_SUMMARY.
   *
   * Includes repository context, execution statistics, and a per-user
   * status table. Skips gracefully when not running inside GitHub Actions.
   *
   * @param {object} result - Sync result containing created, updated, skipped, failed arrays
   * @param {object} [context={}] - Optional execution context
   * @param {string} [context.repository] - GitHub repository name
   * @param {string} [context.enterprise] - Enterprise slug
   * @param {string} [context.workflowName] - Workflow name
   * @param {string} [context.executionTime] - ISO timestamp of execution
   * @returns {Promise<void>}
   */
  async writeJobSummary(result, context = {}) {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;

    if (!summaryFile) {
      logger.info(
        "GITHUB_STEP_SUMMARY is not available. Skipping job summary."
      );
      return;
    }

    const repository = context.repository || "N/A";
    const enterprise = context.enterprise || "N/A";
    const workflowName = context.workflowName || "N/A";
    const executionTime = context.executionTime || new Date().toISOString();

    const detailRows = [
      ...result.created.map(
        (u) =>
          `| ${escapeMarkdownCell(u.username || u.user)} | ✅ Created | — | ${escapeMarkdownCell(u.budget ?? "—")} |`
      ),
      ...result.updated.map(
        (u) =>
          `| ${escapeMarkdownCell(u.user)} | 🔄 Updated | ${escapeMarkdownCell(u.from)} | ${escapeMarkdownCell(u.to)} |`
      ),
      ...result.skipped.map(
        (u) =>
          `| ${escapeMarkdownCell(u.username || u.user)} | ⏭️ Skipped | — | ${escapeMarkdownCell(u.budget ?? "—")} |`
      ),
      ...result.failed.map(
        (u) =>
          `| ${escapeMarkdownCell(u.user)} | ❌ Failed | — | — |`
      )
    ].join("\n");

    const summary = [
      "## GitHub Copilot Budget Guardian — Synchronization Report",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| **Repository** | ${escapeMarkdownCell(repository)} |`,
      `| **Enterprise** | ${escapeMarkdownCell(enterprise)} |`,
      `| **Workflow** | ${escapeMarkdownCell(workflowName)} |`,
      `| **Execution Time** | ${escapeMarkdownCell(executionTime)} |`,
      `| **Created** | ${result.created.length} |`,
      `| **Updated** | ${result.updated.length} |`,
      `| **Skipped** | ${result.skipped.length} |`,
      `| **Failed** | ${result.failed.length} |`,
      "",
      "## Changed Users",
      "",
      "| Username | Status | Previous Budget | New Budget |",
      "|----------|--------|----------------:|-----------:|",
      detailRows || "| — | — | — | — |",
      "",
      "> 📦 Full reports are available in **GitHub Actions Artifacts** (`budget-sync-report`).",
      ""
    ].join("\n");

    await fs.promises.appendFile(summaryFile, summary);

    logger.success("GitHub Job Summary written.");
  }
}

module.exports = new ReportService();