# GitHub Copilot Budget Guardian

> Enterprise-grade GitHub Action for automated GitHub Copilot budget governance, validation, synchronization, reporting, and operational visibility.

![GitHub Marketplace Ready](https://img.shields.io/badge/GitHub%20Marketplace-Ready-2ea44f?style=for-the-badge)
![Enterprise](https://img.shields.io/badge/Enterprise-Ready-0969da?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-24-3c873a?style=for-the-badge)

## 1. Header

GitHub Copilot Budget Guardian helps enterprise teams manage Copilot budgets as code with a safe, auditable, and repeatable GitHub Actions workflow.

---

## 2. Table of Contents

- [1. Header](#1-header)
- [2. Table of Contents](#2-table-of-contents)
- [3. Project Overview](#3-project-overview)
- [4. Why Use This Action](#4-why-use-this-action)
- [5. Features](#5-features)
- [6. Architecture](#6-architecture)
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
- [19. Troubleshooting](#19-troubleshooting)
- [20. Best Practices](#20-best-practices)
- [21. FAQ](#21-faq)
- [22. Roadmap](#22-roadmap)
- [23. Contributing](#23-contributing)
- [24. License](#24-license)
- [25. Author](#25-author)

---

## 3. Project Overview

GitHub Copilot Budget Guardian is a production-focused GitHub Action for enterprise budget governance.

It solves common operational gaps:
- Manual budget updates across teams
- Inconsistent or delayed governance execution
- Limited audit visibility into changes
- Risk of overspend from unmanaged drift

With this action, administrators can define budgets in CSV, validate records, compare desired state to enterprise state, create or update budgets when needed, skip unchanged budgets, and generate structured reports.

> [!NOTE]
> This repository is designed for platform teams, DevOps engineers, and enterprise administrators operating GitHub Copilot at scale.

---

## 4. Why Use This Action

### Business Value

- Reduces manual effort and operational errors
- Improves governance consistency across teams
- Supports audit and compliance workflows
- Integrates with existing CI/CD and release processes

### Manual vs Automated

| Capability | Manual Process | GitHub Copilot Budget Guardian |
|---|---|---|
| Budget updates | Repetitive and error-prone | Automated and repeatable |
| Validation | Inconsistent | Built-in validation rules |
| Drift handling | Hard to track | Compare-and-sync approach |
| Reporting | Manual exports | Markdown, JSON, and CSV reports |
| Change visibility | Limited | Action logs + Step Summary + outputs |

---

## 5. Features

- CSV budget management
- Budget validation
- GitHub Enterprise REST API integration
- Dry-run support
- Budget comparison engine
- Create missing budgets
- Update changed budgets
- Skip unchanged budgets
- Markdown report generation
- JSON report generation
- CSV report generation
- GitHub Actions Step Summary publishing
- GitHub Action outputs (`created`, `updated`, `skipped`, `failed`)
- Unit test coverage with Jest
- Enterprise-ready structured logging

---

## 6. Architecture

This project maintains editable Mermaid documentation:

- [Architecture Overview](docs/architecture.md)
- [Architecture Diagram (Mermaid)](docs/architecture-diagram.md)
- [Sequence Diagram (Mermaid)](docs/sequence-diagram.md)
- [API Integration Reference](docs/api.md)

High-level flow:

```text
CSV File -> Validator -> Compare Engine -> GitHub Enterprise API -> Create/Update/Skip -> Reports -> GitHub Actions Summary
```

---

## 7. Project Structure

```text
github-copilot-budget-guardian
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── release.yml
│       └── test.yml
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── RELEASE_NOTES.md
├── SECURITY.md
├── action.yml
├── build.js
├── budget-report.csv
├── budget-report.json
├── budget-report.md
├── dist/
│   └── index.js
├── docs/
│   ├── api.md
│   ├── architecture-diagram.md
│   ├── architecture.md
│   └── sequence-diagram.md
├── examples/
│   ├── budgets.csv
│   └── workflow.yml
├── package-lock.json
├── package.json
├── src/
│   ├── alert-service.js
│   ├── budget-service.js
│   ├── config.js
│   ├── constants.js
│   ├── github-client.js
│   ├── index.js
│   ├── logger.js
│   ├── models/
│   │   └── Budget.js
│   ├── report-service.js
│   ├── sync-service.js
│   ├── utils.js
│   └── validator.js
├── templates/
└── tests/
    ├── budget-service.test.js
    ├── github-client.test.js
    ├── manual/
    │   └── test-api.js
    ├── report-service.test.js
    ├── sync-service.test.js
    └── validator.test.js
```

---

## 8. Prerequisites

- Node.js 24+
- GitHub Enterprise with Copilot budget administration access
- Personal Access Token with required enterprise permissions
- GitHub Actions enabled for the repository
- Budget CSV file

> [!WARNING]
> Use GitHub Secrets for sensitive values such as `github-token`, `slack-webhook`, and `teams-webhook`.

---
```bash
git clone https://github.com/xebia-playground/GitHub-Copilot-Budget-Guardian.git
cd GitHub-Copilot-Budget-Guardian
```
```

3. Run tests:

```bash
npm test
```

4. Build distribution:

```bash
npm run build
```

5. Run locally:

```bash
node src/index.js
```

---

## 10. Configuration

### Action Inputs (source of truth: action.yml)

| Input | Required | Default | Description |
|---|---|---|---|
| `github-token` | Yes | N/A | GitHub Personal Access Token with enterprise permissions |
| `enterprise-slug` | Yes | N/A | GitHub Enterprise slug |
| `budget-file` | No | `budgets.csv` | Path to budget CSV file |
| `dry-run` | No | `false` | Preview changes without updating budgets |
| `report-format` | No | `markdown` | Report output format: `markdown`, `json`, `csv` |
| `alert-threshold` | No | `80` | Budget utilization alert threshold percentage. This input is reserved for future budget alerting capabilities and is currently validated but not actively used. |
| `slack-webhook` | No | empty | Slack Incoming Webhook URL |
| `teams-webhook` | No | empty | Microsoft Teams Incoming Webhook URL |

---

## 11. CSV Format

Example:

```csv
username,budget,reason,team
alice,100,Onboarding,Platform
bob,250,Quarterly allocation,DevOps
carol,300,Core team budget,Engineering
```

Columns:

| Column | Type | Description |
|---|---|---|
| `username` | string | GitHub user login to budget |
| `budget` | number | Budget amount |
| `reason` | string | Optional budget rationale |
| `team` | string | Optional team label |

---

## 12. How To Use

1. Prepare your CSV file, for example [examples/budgets.csv](examples/budgets.csv).
2. Add or copy a workflow such as [examples/workflow.yml](examples/workflow.yml).
3. Configure repository secrets for token and optional webhooks.
4. Trigger the workflow using workflow_dispatch or schedule.
5. Review logs, Step Summary, and generated reports.

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
        id: guardian
        uses: ./
        with:
          github-token: ${{ secrets.ENTERPRISE_ADMIN_PAT }}
          enterprise-slug: ${{ secrets.ENTERPRISE_SLUG }}
          budget-file: examples/budgets.csv
          dry-run: "false"
          report-format: markdown
          alert-threshold: "80"
          slack-webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          teams-webhook: ${{ secrets.TEAMS_WEBHOOK_URL }}

      - name: Display outputs
        run: |
          echo "created=${{ steps.guardian.outputs.created }}"
          echo "updated=${{ steps.guardian.outputs.updated }}"
          echo "skipped=${{ steps.guardian.outputs.skipped }}"
          echo "failed=${{ steps.guardian.outputs.failed }}"
```

> [!NOTE]
> For Marketplace usage, change `uses: ./` to `uses: <owner>/<repo>@<version>`.

---

## 14. Outputs

This action exposes the following outputs:

- `created`
- `updated`
- `skipped`
- `failed`

Output usage:

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

| File | Format | Purpose |
|---|---|---|
| `budget-report.md` | Markdown | Human-readable summary |
| `budget-report.json` | JSON | Machine-readable integration payload |
| `budget-report.csv` | CSV | Spreadsheet and audit export |

---

## 16. Dry Run Mode

Dry-run mode validates and compares data but does not execute create or update API calls.

When to use:
- Before production rollout
- During change review
- For CSV quality checks

Example:

```yaml
dry-run: "true"
```

---

## 17. Live Synchronization

Live synchronization flow:
- Validate CSV records
- Fetch existing enterprise budgets
- Compare current vs desired state
- Create missing budgets
- Update changed budgets
- Skip unchanged budgets
- Generate reports and publish summary

---

## 18. Sample Console Output

```text
📂 GitHub Copilot Budget Guardian
ℹ️ Reading budget file: /workspace/examples/budgets.csv
✅ 3 budget records loaded.
✅ Budget validation passed.
ℹ️ Fetching existing Copilot budgets...
ℹ️ CREATE -> alice
ℹ️ UPDATE -> bob (200 -> 250)
ℹ️ SKIP -> carol
✅ budget-report.md generated.
✅ budget-report.json generated.
✅ budget-report.csv generated.
✅ Synchronization completed.
```

---

## 19. Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| `401 Unauthorized` | Invalid or expired token | Regenerate token and update repository secret |
| `403 Forbidden` | Insufficient enterprise permissions | Grant required enterprise-level scopes |
| `404 Not Found` | Invalid `enterprise-slug` | Verify enterprise slug and API access |
| CSV validation failed | Missing or invalid `username` / `budget` values | Correct CSV structure and value types |
| Empty synchronization changes | Existing budgets already match desired state | Review generated report and skipped count |

---

## 20. Best Practices

- Keep CSV files under pull-request review
- Run dry-run before live synchronization
- Rotate tokens and webhooks regularly
- Archive reports for audit trails
- Keep [CHANGELOG.md](CHANGELOG.md), [RELEASE_NOTES.md](RELEASE_NOTES.md), and docs current

---

## 21. FAQ

1. Can I manage multiple users in one run?
Yes, include multiple rows in the CSV.

2. Can I run this action on a schedule?
Yes, use a cron schedule in your workflow.

3. Does the action skip unchanged budgets?
Yes, unchanged budgets are tracked as `skipped`.

4. Are JSON and CSV reports both supported?
Yes, select via `report-format`.

5. Is GitHub Enterprise API integration built in?
Yes, integration is implemented in [src/github-client.js](src/github-client.js).

6. Can I use it locally?
Yes, local execution is supported for development and validation.

7. Where can I find a workflow example?
Use [examples/workflow.yml](examples/workflow.yml).

8. Where can I find architecture and sequence diagrams?
See [docs/architecture-diagram.md](docs/architecture-diagram.md) and [docs/sequence-diagram.md](docs/sequence-diagram.md).

9. Are outputs available for downstream jobs?
Yes, use `created`, `updated`, `skipped`, and `failed`.

10. Is unit testing included?
Yes, Jest tests exist under [tests](tests).

---

## 22. Roadmap

- Enhanced notification strategies for Slack and Teams
- Email-based alerting support
- Additional governance analytics and dashboards
- Extended budget management operations

---

## 23. Contributing

Contributions are welcome. Start here:
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

---

## 24. License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

---

## 25. Author

**Kuldeep Saini**

GitHub Platform Engineer | Open Source Contributor

Passionate about building enterprise-grade GitHub Actions, CI/CD automation, GitHub Enterprise solutions, and developer productivity tools.
