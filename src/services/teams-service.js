const logger = require("../logger");
const { postJson } = require("../utils");

/**
 * Sends an Adaptive Card notification to Microsoft Teams.
 *
 * The webhook URL is read from context (passed from TEAMS_WEBHOOK input/secret).
 * Skips gracefully when the webhook URL is not configured.
 *
 * @param {object} context - Notification context
 * @param {string} context.repository - GitHub repository name
 * @param {string} context.enterprise - Enterprise slug
 * @param {string} context.workflowName - Workflow name
 * @param {string} context.runUrl - Workflow run URL
 * @param {string} context.executionTime - ISO timestamp of execution
 * @param {string} context.teamsWebhook - Microsoft Teams Incoming Webhook URL
 * @param {object} result - Sync result containing created, updated, skipped, failed arrays
 * @returns {Promise<void>}
 */
async function sendTeams(context, result) {
  const webhookUrl = context.teamsWebhook;

  if (!webhookUrl) {
    logger.warning(
      "TEAMS_WEBHOOK is not configured. Skipping Teams notification."
    );
    return;
  }

  const statusColor =
    result.failed.length > 0
      ? "Attention"
      : result.created.length + result.updated.length > 0
      ? "Good"
      : "Default";

  const changedUserRows = [
    ...result.created.map((u) => buildTableRow(u.username || u.user, "Created", "Good")),
    ...result.updated.map((u) =>
      buildTableRow(u.user, `Updated (${u.from} → ${u.to})`, "Accent")
    ),
    ...result.failed.map((u) =>
      buildTableRow(u.user, `Failed: ${u.error}`, "Attention")
    )
  ];

  const tableSection =
    changedUserRows.length > 0
      ? [
          {
            type: "TextBlock",
            text: "Changed Users",
            weight: "Bolder",
            spacing: "Medium"
          },
          {
            type: "Table",
            columns: [{ width: 1 }, { width: 2 }],
            rows: [
              {
                type: "TableRow",
                style: "emphasis",
                cells: [
                  {
                    type: "TableCell",
                    items: [
                      { type: "TextBlock", text: "User", weight: "Bolder" }
                    ]
                  },
                  {
                    type: "TableCell",
                    items: [
                      { type: "TextBlock", text: "Status", weight: "Bolder" }
                    ]
                  }
                ]
              },
              ...changedUserRows
            ]
          }
        ]
      : [];

  const payload = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: "GitHub Copilot Budget Synchronization Completed",
              weight: "Bolder",
              size: "Large",
              color: statusColor
            },
            {
              type: "FactSet",
              facts: [
                { title: "Repository", value: context.repository },
                { title: "Enterprise", value: context.enterprise },
                { title: "Workflow", value: context.workflowName },
                { title: "Execution Time", value: context.executionTime },
                { title: "Created", value: String(result.created.length) },
                { title: "Updated", value: String(result.updated.length) },
                { title: "Skipped", value: String(result.skipped.length) },
                { title: "Failed", value: String(result.failed.length) }
              ]
            },
            ...tableSection,
            {
              type: "TextBlock",
              text: "Full reports are available in GitHub Actions Artifacts (budget-sync-report).",
              isSubtle: true,
              wrap: true,
              spacing: "Medium"
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Workflow Run",
              url: context.runUrl
            }
          ]
        }
      }
    ]
  };

  await postJson(webhookUrl, payload);

  logger.success("Microsoft Teams notification sent.");
}

/**
 * Builds an Adaptive Card TableRow for a changed user.
 *
 * @param {string} user - Username
 * @param {string} statusText - Status description
 * @param {string} color - Adaptive Card color token
 * @returns {object} Adaptive Card TableRow
 */
function buildTableRow(user, statusText, color) {
  return {
    type: "TableRow",
    cells: [
      {
        type: "TableCell",
        items: [{ type: "TextBlock", text: user, wrap: true }]
      },
      {
        type: "TableCell",
        items: [
          { type: "TextBlock", text: statusText, color, wrap: true }
        ]
      }
    ]
  };
}

module.exports = { sendTeams };
