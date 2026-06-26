# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-26

### Added

- CSV Budget Management for GitHub Copilot budget definitions.
- GitHub Enterprise integration for budget synchronization workflows.
- Live budget creation for missing budget entities.
- Live budget update for existing budget entities.
- Dry run mode to preview changes without applying updates.
- Budget validation for CSV structure and data integrity.
- Markdown report generation for human-readable summaries.
- JSON report generation for machine-readable automation output.
- CSV report generation for spreadsheet and audit workflows.
- GitHub Actions Step Summary publishing for workflow visibility.
- GitHub Action outputs for `created`, `updated`, `skipped`, and `failed` metrics.
- Enterprise-ready structured logging for observability and diagnostics.

### Changed

- Initial production release of GitHub Copilot Budget Guardian.

### Fixed

- N/A in initial release.

### Security

- Designed for secret-based authentication via GitHub Actions inputs and repository secrets.

