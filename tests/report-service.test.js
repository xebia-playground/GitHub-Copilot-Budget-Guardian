const fs = require("fs");
const path = require("path");

jest.mock("../src/logger", () => ({
  success: jest.fn(),
  info: jest.fn()
}));

const logger = require("../src/logger");
const reportService = require("../src/report-service");

describe("report-service.generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, "mkdirSync").mockImplementation(() => {});
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.useFakeTimers().setSystemTime(new Date("2026-06-26T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    fs.mkdirSync.mockRestore();
    fs.writeFileSync.mockRestore();
  });

  test("generates markdown, json, and csv reports", () => {
    const budgets = [
      { username: "alice", budget: 100, team: "Platform", reason: "Init" }
    ];
    const result = {
      created: [budgets[0]],
      updated: [],
      skipped: [],
      failed: []
    };

    reportService.generate(budgets, result);

    expect(fs.mkdirSync).toHaveBeenCalledWith("artifacts", { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      path.join("artifacts", "budget-report.md"),
      expect.stringContaining("| Created | 1 |")
    );
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      2,
      path.join("artifacts", "budget-report.json"),
      expect.stringContaining('"total": 1')
    );
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      3,
      path.join("artifacts", "budget-report.csv"),
      expect.stringContaining("alice,100,Platform,Init")
    );
    expect(logger.success).toHaveBeenCalledTimes(3);
  });

  test("handles edge case with empty budget list and default result", () => {
    reportService.generate([]);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    const markdown = fs.writeFileSync.mock.calls[0][1];
    expect(markdown).toContain("| Total Budgets | 0 |");
    expect(markdown).toContain("| Created | 0 |");
  });

  test("throws when write fails", () => {
    fs.writeFileSync.mockImplementationOnce(() => {
      throw new Error("Disk full");
    });

    expect(() => reportService.generate([])).toThrow("Disk full");
  });

  test("neutralizes CSV formula-injection values", () => {
    const budgets = [
      {
        username: "=cmd|'/C calc'!A0",
        budget: "+2",
        team: "-Ops",
        reason: "@alert"
      }
    ];

    reportService.generate(budgets, {
      created: [],
      updated: [],
      skipped: [],
      failed: []
    });

    const csvOutput = fs.writeFileSync.mock.calls[2][1];
    expect(csvOutput).toContain(
      "'=cmd|'/C calc'!A0,'+2,'-Ops,'@alert"
    );
  });

  test("neutralizes CSV formula-injection values with leading whitespace", () => {
    const budgets = [
      {
        username: " =1+1",
        budget: "  +SUM(A1:A2)",
        team: " -10",
        reason: " @test"
      }
    ];

    reportService.generate(budgets, {
      created: [],
      updated: [],
      skipped: [],
      failed: []
    });

    const csvOutput = fs.writeFileSync.mock.calls[2][1];
    expect(csvOutput).toContain(
      "' =1+1,'  +SUM(A1:A2),' -10,' @test"
    );
  });
});

describe("report-service.writeJobSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_STEP_SUMMARY = "/tmp/summary.md";
    jest.spyOn(fs.promises, "appendFile").mockResolvedValue();
  });

  afterEach(() => {
    delete process.env.GITHUB_STEP_SUMMARY;
    fs.promises.appendFile.mockRestore();
  });

  test("escapes markdown table values in summary fields and changed users", async () => {
    const result = {
      created: [{ username: "alice|admin\nroot", budget: "5\r" }],
      updated: [{ user: "bob|ops", from: "1\n2", to: "3\r4" }],
      skipped: [{ username: "carol\nteam", budget: "10|11" }],
      failed: [{ user: "dave\r|x", error: "boom" }]
    };

    const context = {
      repository: "acme/repo|prod",
      enterprise: "ent\nname",
      workflowName: "Budget\rSync",
      executionTime: "2026-01-01T00:00:00.000Z"
    };

    await reportService.writeJobSummary(result, context);

    expect(fs.promises.appendFile).toHaveBeenCalledTimes(1);
    const summary = fs.promises.appendFile.mock.calls[0][1];
    expect(summary).toContain("acme/repo\\|prod");
    expect(summary).toContain("ent name");
    expect(summary).toContain("Budget Sync");
    expect(summary).toContain("alice\\|admin root");
    expect(summary).toContain("bob\\|ops");
    expect(summary).toContain("dave \\|x");
    expect(summary).toContain("## User Budget Status");
    expect(summary).not.toContain("## Changed Users");
  });
});
