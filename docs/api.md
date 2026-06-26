# API Integration Reference

This document describes the GitHub Enterprise budget API operations used by GitHub Copilot Budget Guardian.

## Client Module

- Implementation: `src/github-client.js`
- Runtime dependency: `@actions/github`
- Authentication: token passed from `github-token` input

## Endpoints Used

| Operation | Method and Route | Purpose |
|---|---|---|
| List budgets | `GET /enterprises/{enterprise}/settings/billing/budgets` | Fetch existing Copilot budgets for comparison |
| Create budget | `POST /enterprises/{enterprise}/settings/billing/budgets` | Create missing user budget entries |
| Update budget | `PATCH /enterprises/{enterprise}/settings/billing/budgets/{budget_id}` | Update changed budget amounts |

## Request Payloads

### Create Budget

```json
{
	"budget_amount": 100,
	"budget_scope": "user",
	"user": "octocat",
	"prevent_further_usage": true,
	"budget_product_sku": "premium_requests",
	"budget_type": "BundlePricing",
	"budget_alerting": {
		"will_alert": false,
		"alert_recipients": []
	}
}
```

### Update Budget

```json
{
	"budget_amount": 150,
	"user": "octocat",
	"prevent_further_usage": true,
	"budget_alerting": {
		"will_alert": false,
		"alert_recipients": []
	}
}
```

## Error Handling Behavior

- List failure: action logs warning and continues in local comparison mode.
- Create or update failure: action records the failure per budget and continues processing remaining entries.

## Notes

- The action does not modify endpoints at runtime.
- Use dry-run mode to preview synchronization without API write operations.
