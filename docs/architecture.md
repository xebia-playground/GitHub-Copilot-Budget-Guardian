# Architecture

GitHub Copilot Budget Guardian follows a modular service-oriented architecture designed for GitHub Actions runtime execution.

## High-Level Flow

1. Load budget definitions from CSV.
2. Validate schema and business constraints.
3. Compare desired budgets with enterprise state.
4. Create missing budgets.
5. Update existing budgets when amounts differ.
6. Generate reports and publish workflow summary.

## Components

| Component | Responsibility |
|---|---|
| CSV File | Source of truth for budget definitions |
| Validator | Ensures data quality and prevents invalid changes |
| Compare Engine | Calculates create, update, and skip decisions |
| GitHub Enterprise API | Executes create and update operations |
| Report Generator | Produces markdown, JSON, and CSV reports |
| GitHub Actions Summary | Displays run outcomes in workflow UI |

## Mermaid Diagrams

- [Architecture Flow](architecture-diagram.md)
- [Sequence Flow](sequence-diagram.md)
