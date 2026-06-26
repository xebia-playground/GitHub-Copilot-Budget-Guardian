jest.mock("@actions/github", () => ({
  getOctokit: jest.fn()
}));

jest.mock("../src/logger", () => ({
  info: jest.fn(),
  success: jest.fn()
}));

const github = require("@actions/github");
const logger = require("../src/logger");
const GitHubClient = require("../src/github-client");

describe("github-client", () => {
  let request;
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    request = jest.fn();
    github.getOctokit.mockReturnValue({ request });
    client = new GitHubClient("token");
  });

  test("getExistingBudgets returns budgets and logs entries", async () => {
    const budgets = [
      {
        budget_scope: "user",
        budget_entity_name: "alice",
        budget_amount: 100
      }
    ];

    request.mockResolvedValue({ data: { budgets } });

    const result = await client.getExistingBudgets("ent");

    expect(request).toHaveBeenCalledWith(
      "GET /enterprises/{enterprise}/settings/billing/budgets",
      { enterprise: "ent", per_page: 100 }
    );
    expect(result).toEqual(budgets);
    expect(logger.info).toHaveBeenCalledWith(
      "user | alice | 100"
    );
  });

  test("getExistingBudgets returns empty list when response has no budgets", async () => {
    request.mockResolvedValue({ data: {} });

    const result = await client.getExistingBudgets("ent");

    expect(result).toEqual([]);
  });

  test("createBudget sends expected payload defaults", async () => {
    request.mockResolvedValue({ data: { id: 1 } });

    const result = await client.createBudget("ent", {
      budget_amount: 200,
      user: "alice"
    });

    expect(request).toHaveBeenCalledWith(
      "POST /enterprises/{enterprise}/settings/billing/budgets",
      expect.objectContaining({
        enterprise: "ent",
        budget_amount: 200,
        budget_scope: "user",
        user: "alice",
        prevent_further_usage: true,
        budget_product_sku: "premium_requests",
        budget_type: "BundlePricing"
      })
    );
    expect(result).toEqual({ id: 1 });
  });

  test("updateBudget sends expected payload", async () => {
    request.mockResolvedValue({ data: { id: 2 } });

    const result = await client.updateBudget("ent", 10, {
      budget_amount: 300,
      user: "bob",
      prevent_further_usage: false,
      budget_alerting: {
        will_alert: true,
        alert_recipients: ["ops@example.com"]
      }
    });

    expect(request).toHaveBeenCalledWith(
      "PATCH /enterprises/{enterprise}/settings/billing/budgets/{budget_id}",
      {
        enterprise: "ent",
        budget_id: 10,
        budget_amount: 300,
        user: "bob",
        prevent_further_usage: false,
        budget_alerting: {
          will_alert: true,
          alert_recipients: ["ops@example.com"]
        }
      }
    );
    expect(result).toEqual({ id: 2 });
  });

  test("propagates API errors", async () => {
    request.mockRejectedValue(new Error("API error"));

    await expect(client.getExistingBudgets("ent")).rejects.toThrow("API error");
  });
});
