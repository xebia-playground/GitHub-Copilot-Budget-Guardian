jest.mock("../src/logger", () => ({
  success: jest.fn(),
  warning: jest.fn()
}));

jest.mock("../src/utils", () => ({
  postJson: jest.fn()
}));

const logger = require("../src/logger");
const { postJson } = require("../src/utils");
const { sendTeams } = require("../src/services/teams-service");

const baseContext = {
  repository: "acme/copilot",
  enterprise: "acme-enterprise",
  workflowName: "Budget Sync",
  runUrl: "https://github.com/acme/copilot/actions/runs/1",
  executionTime: "2026-01-01T00:00:00.000Z",
  teamsWebhook: "https://outlook.office.com/webhook/test"
};

const baseResult = {
  created: [{ username: "alice", budget: 100 }],
  updated: [{ user: "bob", from: 100, to: 200 }],
  skipped: [{ username: "carol", budget: 300 }],
  failed: []
};

describe("teams-service.sendTeams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    postJson.mockResolvedValue();
  });

  test("skips gracefully when teamsWebhook is not configured", async () => {
    const context = { ...baseContext, teamsWebhook: "" };
    await sendTeams(context, baseResult);

    expect(postJson).not.toHaveBeenCalled();
    expect(logger.warning).toHaveBeenCalledWith(
      "TEAMS_WEBHOOK is not configured. Skipping Teams notification."
    );
  });

  test("sends Adaptive Card payload to the webhook URL", async () => {
    await sendTeams(baseContext, baseResult);

    expect(postJson).toHaveBeenCalledTimes(1);
    const [url, payload] = postJson.mock.calls[0];
    expect(url).toBe(baseContext.teamsWebhook);
    expect(payload.type).toBe("message");
    expect(payload.attachments[0].contentType).toBe(
      "application/vnd.microsoft.card.adaptive"
    );
  });

  test("includes repository and enterprise in FactSet", async () => {
    await sendTeams(baseContext, baseResult);

    const [, payload] = postJson.mock.calls[0];
    const card = payload.attachments[0].content;
    const factSet = card.body.find((b) => b.type === "FactSet");
    const titles = factSet.facts.map((f) => f.title);
    expect(titles).toContain("Repository");
    expect(titles).toContain("Enterprise");

    const repoFact = factSet.facts.find((f) => f.title === "Repository");
    expect(repoFact.value).toBe("acme/copilot");
  });

  test("includes workflow run URL as an action", async () => {
    await sendTeams(baseContext, baseResult);

    const [, payload] = postJson.mock.calls[0];
    const card = payload.attachments[0].content;
    const action = card.actions[0];
    expect(action.url).toBe(baseContext.runUrl);
  });

  test("uses Attention color when there are failures", async () => {
    const resultWithFailure = {
      ...baseResult,
      failed: [{ user: "dave", error: "API error" }]
    };

    await sendTeams(baseContext, resultWithFailure);

    const [, payload] = postJson.mock.calls[0];
    const card = payload.attachments[0].content;
    const header = card.body.find((b) => b.type === "TextBlock");
    expect(header.color).toBe("Attention");
  });

  test("uses Good color when there are changes and no failures", async () => {
    await sendTeams(baseContext, baseResult);

    const [, payload] = postJson.mock.calls[0];
    const card = payload.attachments[0].content;
    const header = card.body.find((b) => b.type === "TextBlock");
    expect(header.color).toBe("Good");
  });

  test("logs warning and does not throw when postJson rejects", async () => {
    postJson.mockRejectedValue(new Error("Network error"));

    await expect(sendTeams(baseContext, baseResult)).rejects.toThrow(
      "Network error"
    );
  });

  test("logs success after successful send", async () => {
    await sendTeams(baseContext, baseResult);

    expect(logger.success).toHaveBeenCalledWith(
      "Microsoft Teams notification sent."
    );
  });
});
