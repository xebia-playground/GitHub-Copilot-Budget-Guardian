# Release Notes

## v1.0.0 - 2026-06-26

GitHub Copilot Budget Guardian v1.0.0 is the first production release focused on enterprise-grade GitHub Copilot budget governance, validation, synchronization, and reporting.

## Highlights

- Enterprise-ready GitHub Action architecture for budget governance workflows
- CSV-driven budget configuration for consistent budget operations
- Live synchronization support for create and update scenarios
- Safe dry-run mode for pre-deployment validation
- Multi-format reporting for operations and audit visibility

## New Features

### Budget Management and Synchronization

- CSV Budget Management
- GitHub Enterprise Integration
- Live Budget Create
- Live Budget Update
- Budget Validation
- Dry Run Mode

### Reporting and Outputs

- Markdown Report generation
- JSON Report generation
- CSV Report generation
- GitHub Actions Step Summary support
- GitHub Action Outputs:
  - created
  - updated
  - skipped
  - failed

### Observability

- Enterprise Ready Logging for operational traceability and troubleshooting

## GitHub Action Inputs

- github-token
- enterprise-slug
- budget-file
- dry-run
- report-format
- alert-threshold
- slack-webhook
- teams-webhook

## Compatibility

- Runtime: Node.js 24 (GitHub Actions)
- Module format: CommonJS
- Target: GitHub Enterprise budget governance workflows

## Upgrade Notes

- Initial release. No migration is required.
- For production usage, configure repository secrets before running workflows.
- Start with dry-run mode to validate CSV and compare behavior safely.

## Known Limitations

- Notification webhook integrations are input-ready and can be expanded further in upcoming versions.

## Next Steps

Planned areas for future releases include:

- Enhanced Slack and Teams notification workflows
- Additional alerting channels
- Extended analytics and governance dashboards

## Acknowledgements

Thank you to enterprise administrators, platform engineers, and DevOps teams validating GitHub Copilot Budget Guardian for real-world governance scenarios.
