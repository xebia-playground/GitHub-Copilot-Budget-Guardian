const fs = require("fs");

jest.mock("../src/logger", () => ({
  success: jest.fn()
}));

const logger = require("../src/logger");
const reportService = require("../src/report-service");

describe("report-service.generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.useFakeTimers().setSystemTime(new Date("2026-06-26T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
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

    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      "budget-report.md",
      expect.stringContaining("| Created | 1 |")
    );
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      2,
      "budget-report.json",
      expect.stringContaining('"total": 1')
    );
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      3,
      "budget-report.csv",
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
});
