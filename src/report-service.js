const fs = require("fs");
const logger = require("./logger");

class ReportService {
  generate(budgets) {
    const markdown = `# GitHub Copilot Budget Guardian Report

## Summary

- Total Users: ${budgets.length}
- Generated: ${new Date().toISOString()}

## Users

| Username | Budget | Team | Reason |
|----------|--------|------|--------|
${budgets.map(u =>
`| ${u.username} | ${u.budget} | ${u.team} | ${u.reason} |`
).join("\n")}
`;

    fs.writeFileSync("budget-report.md", markdown);

    logger.success("budget-report.md generated.");
  }
}

module.exports = new ReportService();