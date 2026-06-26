jest.mock("../src/logger", () => ({
  startGroup: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  setOutput: jest.fn(),
  endGroup: jest.fn()
}));

jest.mock("../src/validator", () => ({
  validateBudgets: jest.fn()
}));

jest.mock("../src/report-service", () => ({
  generate: jest.fn()
}));

const logger = require("../src/logger");
const validator = require("../src/validator");
const reportService = require("../src/report-service");
const syncService = require("../src/sync-service");

describe("sync-service.sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates, updates, and skips based on comparison", async () => {
    const budgets = [
      { username: "alice", budget: 100 },
      { username: "bob", budget: 250 },
      { username: "carol", budget: 300 }
    ];

    const githubClient = {
      getExistingBudgets: jest.fn().mockResolvedValue([
        { id: 1, budget_entity_name: "bob", budget_amount: 200 },
        { id: 2, budget_entity_name: "carol", budget_amount: 300 }
      ]),
      createBudget: jest.fn().mockResolvedValue({}),
      updateBudget: jest.fn().mockResolvedValue({})
    };

    const config = {
      enterpriseSlug: "demo-enterprise",
      dryRun: false
    };

    const result = await syncService.sync(budgets, githubClient, config);

    expect(result.created).toHaveLength(1);
    expect(result.updated).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.failed).toHaveLength(0);

    expect(githubClient.createBudget).toHaveBeenCalledWith("demo-enterprise", {
      budget_amount: 100,
      budget_scope: "user",
      user: "alice",
      prevent_further_usage: true
    });

    expect(githubClient.updateBudget).toHaveBeenCalledWith("demo-enterprise", 1, {
      budget_amount: 250,
      user: "bob",
      prevent_further_usage: true
    });

    expect(reportService.generate).toHaveBeenCalledWith(budgets, result);
    expect(logger.setOutput).toHaveBeenCalledWith("created", 1);
    expect(logger.setOutput).toHaveBeenCalledWith("updated", 1);
    expect(logger.setOutput).toHaveBeenCalledWith("skipped", 1);
    expect(logger.setOutput).toHaveBeenCalledWith("failed", 0);
  });

  test("does not call create/update APIs in dry-run mode", async () => {
    const budgets = [{ username: "alice", budget: 100 }];

    const githubClient = {
      getExistingBudgets: jest.fn().mockResolvedValue([]),
      createBudget: jest.fn(),
      updateBudget: jest.fn()
    };

    const config = {
      enterpriseSlug: "demo-enterprise",
      dryRun: true
    };

    const result = await syncService.sync(budgets, githubClient, config);

    expect(result.created).toHaveLength(1);
    expect(githubClient.createBudget).not.toHaveBeenCalled();
    expect(githubClient.updateBudget).not.toHaveBeenCalled();
  });

  test("continues in local mode when fetching existing budgets fails", async () => {
    const budgets = [{ username: "alice", budget: 100 }];

    const githubClient = {
      getExistingBudgets: jest.fn().mockRejectedValue(new Error("API unavailable")),
      createBudget: jest.fn().mockResolvedValue({}),
      updateBudget: jest.fn().mockResolvedValue({})
    };

    const config = {
      enterpriseSlug: "demo-enterprise",
      dryRun: false
    };

    const result = await syncService.sync(budgets, githubClient, config);

    expect(logger.warning).toHaveBeenCalledWith(
      "Unable to fetch existing budgets. Running in local mode."
    );
    expect(result.created).toHaveLength(1);
    expect(githubClient.createBudget).toHaveBeenCalledTimes(1);
  });

  test("captures per-budget API failures in result.failed", async () => {
    const budgets = [{ username: "alice", budget: 100 }];

    const githubClient = {
      getExistingBudgets: jest.fn().mockResolvedValue([]),
      createBudget: jest.fn().mockRejectedValue(new Error("Create failed")),
      updateBudget: jest.fn()
    };

    const config = {
      enterpriseSlug: "demo-enterprise",
      dryRun: false
    };

    const result = await syncService.sync(budgets, githubClient, config);

    expect(result.created).toHaveLength(1);
    expect(result.failed).toEqual([
      {
        user: "alice",
        error: "Create failed"
      }
    ]);
    expect(logger.error).toHaveBeenCalledWith("alice: Create failed");
  });

  test("fails fast when validator throws", async () => {
    const validationError = new Error("Budget validation failed.");
    validator.validateBudgets.mockImplementationOnce(() => {
      throw validationError;
    });

    await expect(syncService.sync([], null, {})).rejects.toThrow(
      "Budget validation failed."
    );

    expect(reportService.generate).not.toHaveBeenCalled();
    expect(logger.endGroup).not.toHaveBeenCalled();
  });
});
