const fs = require("fs");
const logger = require("./logger");

class ReportService {
  generate(budgets, result = {}) {
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

    fs.writeFileSync("budget-report.md", markdown);

    // JSON Report
    fs.writeFileSync(
      "budget-report.json",
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
    let csv =
      "username,budget,team,reason\n";

    budgets.forEach((u) => {
      csv += `${u.username},${u.budget},${u.team},${u.reason}\n`;
    });

    fs.writeFileSync(
      "budget-report.csv",
      csv
    );

    logger.success("budget-report.md generated.");
    logger.success("budget-report.json generated.");
    logger.success("budget-report.csv generated.");
  }
}

module.exports = new ReportService();