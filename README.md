# GitHub Copilot Budget Guardian

> Enterprise-grade GitHub Action for automated GitHub Copilot budget governance, validation, synchronization, reporting, and operational visibility.

![GitHub Marketplace Ready](https://img.shields.io/badge/GitHub%20Marketplace-Ready-2ea44f?style=for-the-badge)
![Enterprise](https://img.shields.io/badge/Enterprise-Ready-0969da?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20%2B-3c873a?style=for-the-badge)

## 1. Attractive Header

GitHub Copilot Budget Guardian helps enterprise teams automate Copilot budget governance with safe, auditable, and repeatable workflows.

---

## 2. Table of Contents

- [1. Attractive Header](#github-copilot-budget-guardian)
- [2. Table of Contents](#2-table-of-contents)
- [3. Project Overview](#3-project-overview)
- [4. Why Use This Action?](#4-why-use-this-action)
- [5. Features](#5-features)
- [6. Architecture Diagram](#6-architecture-diagram)
- [7. Project Structure](#7-project-structure)
- [8. Prerequisites](#8-prerequisites)
- [9. Installation](#9-installation)
- [10. Configuration](#10-configuration)
- [11. CSV Format](#11-csv-format)
- [12. How To Use](#12-how-to-use)
- [13. GitHub Workflow Example](#13-github-workflow-example)
- [14. Outputs](#14-outputs)
- [15. Generated Reports](#15-generated-reports)
- [16. Dry Run Mode](#16-dry-run-mode)
- [17. Live Synchronization](#17-live-synchronization)
- [18. Sample Console Output](#18-sample-console-output)
- [19. Screenshots Section](#19-screenshots-section)
- [20. Troubleshooting](#20-troubleshooting)
- [21. Best Practices](#21-best-practices)
- [22. FAQ](#22-faq)
- [23. Roadmap](#23-roadmap)
- [24. Contributing](#24-contributing)
- [25. License](#25-license)
- [26. Author](#26-author)

---

## 3. Project Overview

GitHub Copilot Budget Guardian is a production-focused GitHub Action designed for enterprise teams that need reliable governance of GitHub Copilot budgets.

It exists to solve common enterprise pain points:
- Manual budget tracking across multiple teams
- Inconsistent budget updates
- Missing audit visibility for budget changes
- Risk of overspending due to delayed enforcement

With this action, administrators can manage budgets as code from CSV, validate changes before execution, synchronize desired state to GitHub Enterprise, and generate clear operational reports.

> [!NOTE]
> This project is built for enterprise operations where predictability, traceability, and repeatable automation matter.

---

## 4. Why Use This Action?

### Business Value

- Reduces operational overhead for platform teams
- Improves financial governance for Copilot adoption
- Enables audit-friendly, repeatable change workflows
- Aligns budget operations with CI/CD and Infrastructure as Code practices

### Enterprise Use Cases

- Quarterly budget updates across business units
- Controlled rollout of Copilot budgets to new teams
- Governance checks before approving budget changes
- Automated reporting for engineering leadership

### Manual vs Automated

| Capability | Manual Process | GitHub Copilot Budget Guardian |
|---|---|---|
| Budget updates | Slow, repetitive, error-prone | Fast, repeatable, automated |
| Validation | Ad hoc checks | Built-in validation rules |
| Audit trail | Fragmented | Workflow logs + reports |
| Drift detection | Difficult | Desired vs current comparison |
| Risk control | Reactive | Dry-run before apply |

> [!TIP]
> Start with dry-run mode in production environments to validate governance changes safely.

---

## 5. Features

- 📄 CSV Budget Management
- ✅ Budget Validation
- 🏢 GitHub Enterprise Integration
- 🧪 Dry Run Mode
- 🔄 Budget Synchronization
- ➕ Create Missing Budgets
- ♻️ Update Existing Budgets
- ⏭️ Skip Unchanged Budgets
- 📝 Markdown Report
- 🧾 JSON Report
- 📊 CSV Report
- 📌 GitHub Actions Step Summary
- 📤 GitHub Action Outputs
- 🛡️ Enterprise Ready
- 📚 Structured Logging

---

## 6. Architecture Diagram

This project maintains editable Mermaid diagrams in the docs folder:

- [Architecture Diagram (Mermaid)](docs/architecture-diagram.md)
- [Sequence Diagram (Mermaid)](docs/sequence-diagram.md)
- [Architecture Overview](docs/architecture.md)
- [API Integration Reference](docs/api.md)

```text
┌───────────────────┐
│   budgets.csv     │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│     Validator     │
└─────────┬─────────┘
          │
          v
┌───────────────────┐
│   Compare Engine  │
└─────────┬─────────┘
          │
          v
┌─────────────────────────────┐
│   GitHub Enterprise API     │
└─────────┬───────────────────┘
          │
          v
┌───────────────────┐
│      Reports      │
└─────────┬─────────┘
          │
          v
┌─────────────────────────────┐
│ GitHub Actions Step Summary │
└─────────────────────────────┘
```

---

## 7. Project Structure

```text
github-copilot-budget-guardian
├── action.yml
├── package.json
├── README.md
├── LICENSE
├── CHANGELOG.md
├── .gitignore
├── src/
│   ├── index.js
│   ├── config.js
│   ├── github-client.js
│   ├── budget-service.js
│   ├── validator.js
│   ├── report-service.js
│   ├── alert-service.js
│   ├── logger.js
│   └── utils.js
├── dist/
├── examples/
│   ├── budgets.csv
│   └── workflow.yml
├── docs/
│   ├── architecture.md
│   ├── architecture-diagram.md
│   ├── sequence-diagram.md
│   └── api.md
└── .github/workflows/
    ├── test.yml
    └── release.yml
```

### Key Components

| Path | Purpose |
|---|---|
| `src/index.js` | Main orchestration entrypoint |
| `src/config.js` | Input parsing and configuration loading |
| `src/github-client.js` | GitHub API integration layer |
| `src/budget-service.js` | Budget comparison and sync logic |
| `src/validator.js` | CSV and domain validation rules |
| `src/report-service.js` | Markdown/JSON/CSV report generation |
| `src/alert-service.js` | Notification integrations |
| `src/logger.js` | Structured GitHub Actions logging |
| `dist/` | Bundled runtime output for marketplace usage |

---

## 8. Prerequisites

- Node.js 20+
- GitHub Enterprise with Copilot budget administration
- Personal Access Token (PAT)
- Enterprise Admin permissions
- GitHub Actions enabled in repository
- Valid budget CSV file

> [!WARNING]
> The token used by this action must have the permissions required to read and update enterprise Copilot budget data.

---

## 9. Installation

1. Clone the repository.

```bash
git clone https://github.com/<your-org>/github-copilot-budget-guardian.git
cd github-copilot-budget-guardian
```

2. Install dependencies.

```bash
npm install
```

3. Build distribution bundle.

```bash
npm run build
```

4. Run local entrypoint (for development validation).

```bash
node src/index.js
```

---

## 10. Configuration

### Action Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `github-token` | Yes | N/A | GitHub Personal Access Token used for API calls |
| `enterprise-slug` | Yes | N/A | Enterprise slug identifier |
| `budget-file` | Yes | N/A | Path to CSV budget definition file |
| `dry-run` | No | `false` | If `true`, validates and reports without applying changes |
| `report-format` | No | `markdown` | Report format: `markdown`, `json`, or `csv` |
| `alert-threshold` | No | `80` | Alert threshold percentage |
| `slack-webhook` | No | empty | Slack webhook URL for notifications |
| `teams-webhook` | No | empty | Microsoft Teams webhook URL for notifications |

> [!TIP]
> Store sensitive values such as tokens and webhooks in GitHub Secrets.

---

## 11. CSV Format

### Example CSV

```csv
team_slug,budget_usd,period,start_date,end_date,notify_emails,enabled
platform-engineering,1200,monthly,2026-01-01,2026-12-31,platform@example.com,true
devops,900,monthly,2026-01-01,2026-12-31,devops@example.com,true
qa,500,monthly,2026-01-01,2026-12-31,qa@example.com,true
```

### Column Definitions

| Column | Type | Description |
|---|---|---|
| `team_slug` | string | Team or scope identifier |
| `budget_usd` | number | Budget amount in USD |
| `period` | string | Budget cycle, for example `monthly` |
| `start_date` | date | Budget start date (`YYYY-MM-DD`) |
| `end_date` | date | Budget end date (`YYYY-MM-DD`) |
| `notify_emails` | string | Comma-separated email recipients |
| `enabled` | boolean | Whether the budget is active |

---

## 12. How To Use

1. Create your `budgets.csv` file.
2. Add workflow configuration in `.github/workflows`.
3. Add required secrets in repository settings.
4. Trigger workflow manually or by schedule.
5. Review action logs and generated report output.

---

## 13. GitHub Workflow Example

```yaml
name: Copilot Budget Governance

on:
  workflow_dispatch:
  schedule:
		- cron: "0 4 * * 1"

jobs:
  copilot-budget-guardian:
		runs-on: ubuntu-latest

		steps:
			- name: Checkout
				uses: actions/checkout@v4

			- name: Run GitHub Copilot Budget Guardian
				uses: ./
				with:
					github-token: ${{ secrets.ENTERPRISE_ADMIN_PAT }}
					enterprise-slug: your-enterprise-slug
					budget-file: examples/budgets.csv
					dry-run: "false"
					report-format: markdown
					alert-threshold: "80"
					slack-webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
					teams-webhook: ${{ secrets.TEAMS_WEBHOOK_URL }}
```

> [!NOTE]
> If you publish this action to Marketplace, replace `uses: ./` with `uses: <owner>/<repo>@<version>`.

---

## 14. Outputs

The action exposes summary metrics that can be used by downstream jobs:

- `created`
- `updated`
- `skipped`
- `failed`

### Output Usage Example

```yaml
- name: Print synchronization stats
  run: |
		echo "Created: ${{ steps.guardian.outputs.created }}"
		echo "Updated: ${{ steps.guardian.outputs.updated }}"
		echo "Skipped: ${{ steps.guardian.outputs.skipped }}"
		echo "Failed: ${{ steps.guardian.outputs.failed }}"
```

---

## 15. Generated Reports

| Format | Purpose | Typical Audience |
|---|---|---|
| Markdown | Human-readable summary in workflow output | Managers, Admins |
| JSON | Structured machine-readable data | Platform automation |
| CSV | Spreadsheet-friendly export | Finance, Operations |

Reports are generated based on the `report-format` input and can be archived as workflow artifacts.

---

## 16. Dry Run Mode

Dry run mode validates input and calculates intended changes without applying updates to enterprise budgets.

### When to Use

- Before major budget updates
- During policy review periods
- While testing new CSV files

### Benefits

- Zero-risk preview
- Early validation feedback
- Better approval confidence

### Example

```yaml
dry-run: "true"
```

---

## 17. Live Synchronization

Live synchronization compares the CSV desired state with current enterprise state and executes only required changes:

- Creates missing budgets
- Updates changed budgets
- Skips unchanged records
- Logs all actions for traceability

This keeps enterprise Copilot budgets continuously aligned with source-controlled configuration.

---

## 18. Sample Console Output

```text
📂 GitHub Copilot Budget Guardian
ℹ️ Loading configuration...
✅ Configuration loaded
ℹ️ Reading CSV: examples/budgets.csv
✅ CSV validation passed (3 records)
ℹ️ Fetching current enterprise budgets for: acme-enterprise
ℹ️ Comparison complete
✅ Created: 1
✅ Updated: 1
ℹ️ Skipped: 1
✅ Report generated: markdown
✅ Step summary published
```

---

## 19. Screenshots Section

Use these sections to include real screenshots from your environment.

### Execution

![Execution Screenshot](docs/images/execution.png)

### Reports

![Reports Screenshot](docs/images/reports.png)

### GitHub Enterprise

![GitHub Enterprise Screenshot](docs/images/github-enterprise.png)

### GitHub Actions

![GitHub Actions Screenshot](docs/images/github-actions.png)

---

## 20. Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| `401 Unauthorized` | Invalid or expired token | Regenerate PAT and update secret |
| `403 Forbidden` | Missing enterprise permissions | Grant enterprise admin access scopes |
| `404 Not Found` | Wrong enterprise slug or endpoint | Verify `enterprise-slug` value |
| CSV validation failed | Invalid columns or malformed data | Validate CSV headers and value types |
| Permission error in workflow | Token missing required scopes | Review token scopes and org policy |

> [!WARNING]
> If you use fine-grained tokens, ensure enterprise-level endpoints are explicitly allowed.

---

## 21. Best Practices

- Keep budget CSV under version control with PR review
- Run dry-run in non-business hours before apply
- Protect default branch with approval rules
- Use scheduled workflows for continuous governance
- Archive reports as artifacts for audit records
- Rotate tokens and webhook secrets regularly
- Keep changelog updated for governance transparency

---

## 22. FAQ

1. **Can this action manage multiple teams in one run?**
   Yes, provide multiple rows in the CSV.
2. **Does it support dry-run?**
   Yes, set `dry-run: "true"`.
3. **Can I use GitHub-hosted runners?**
   Yes, Ubuntu runners are commonly used.
4. **What happens if a budget is unchanged?**
   It is skipped and counted under `skipped`.
5. **Can I run it on a schedule?**
   Yes, use `cron` in workflow triggers.
6. **Is report format configurable?**
   Yes, use `report-format` with `markdown`, `json`, or `csv`.
7. **Does it support Slack notifications?**
   Webhook support is included as an input.
8. **Does it support Microsoft Teams notifications?**
   Webhook support is included as an input.
9. **Can this replace manual budget governance?**
   Yes, that is a primary objective of the action.
10. **Is this suitable for regulated enterprise environments?**
    Yes, with branch controls, audit logs, and artifact retention.

---

## 23. Roadmap

- 🔔 Slack Notifications enhancements
- 💬 Microsoft Teams Notifications enhancements
- 📧 Email Notifications
- 📈 Governance Dashboard
- 📊 Advanced Analytics and trend insights
- 🗑️ Bulk Delete for stale budgets
- 📥 Budget Import from additional enterprise sources

---

## 24. Contributing

Contributions are welcome from platform engineers and open-source maintainers.

### Contribution Flow

1. Fork the repository
2. Create a feature branch
3. Add tests and documentation updates
4. Open a pull request with clear change summary
5. Address review feedback and merge

### Quality Expectations

- Follow modular architecture and separation of concerns
- Use consistent logging and error handling patterns
- Keep documentation and examples up to date
- Prefer small, reviewable pull requests

---

## 25. License

This project is licensed under the MIT License.

---

## 26. Author

**Kuldeep Saini**  
GitHub Platform Engineer

