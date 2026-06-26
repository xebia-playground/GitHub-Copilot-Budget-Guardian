# Security Policy

## Supported Versions

The following versions are currently supported with security updates.

| Version | Supported |
|---|---|
| 1.x | :white_check_mark: |
| < 1.0.0 | :x: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

1. Do not open a public issue with vulnerability details.
2. Send a private report to the maintainers with:
   - A clear description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested mitigation (if available)
3. Include repository, workflow, and environment details where relevant.

## Response Expectations

- Initial acknowledgement: within 3 business days
- Triage and severity assessment: within 7 business days
- Ongoing status updates: provided until resolution

## Disclosure

Please allow maintainers time to validate and remediate before public disclosure.
After a fix is released, coordinated disclosure is encouraged.

## Security Best Practices for Users

- Use GitHub Secrets for sensitive values such as `github-token` and webhooks.
- Run workflows with least-privilege permissions.
- Use dry-run mode before applying budget changes in production.
- Rotate tokens and webhook secrets regularly.
