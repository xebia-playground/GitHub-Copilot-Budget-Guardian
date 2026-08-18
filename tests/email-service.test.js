const fs = require("fs");

jest.mock("../src/logger", () => ({
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
}));

const logger = require("../src/logger");

describe("email-service.sendEmail", () => {
  let sendEmail;
  let mockSendMail;
  let mockCreateTransport;

  const baseContext = {
    repository: "acme/copilot",
    enterprise: "acme-enterprise",
    workflowName: "Budget Sync",
    runUrl: "https://github.com/acme/copilot/actions/runs/1",
    executionTime: "2026-01-01T00:00:00.000Z"
  };

  const baseResult = {
    created: [{ username: "alice", budget: 100 }],
    updated: [{ user: "bob", from: 100, to: 200 }],
    skipped: [],
    failed: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockSendMail = jest.fn().mockResolvedValue({});
    mockCreateTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

    jest.mock("nodemailer", () => ({
      createTransport: mockCreateTransport
    }));

    jest.mock("../src/logger", () => ({
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    }));

    sendEmail = require("../src/services/email-service").sendEmail;
  });

  afterEach(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.ADMIN_NOTIFICATION_EMAILS;
  });

  test("skips gracefully when SMTP configuration is missing", async () => {
    await sendEmail(baseContext, baseResult);

    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  test("skips gracefully when ADMIN_NOTIFICATION_EMAILS is not set", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";

    await sendEmail(baseContext, baseResult);

    expect(mockCreateTransport).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  test("skips gracefully when ADMIN_NOTIFICATION_EMAILS is empty after parsing", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.ADMIN_NOTIFICATION_EMAILS = "  ,  ";

    await sendEmail(baseContext, baseResult);

    expect(mockSendMail).not.toHaveBeenCalled();
  });

  test("sends email with correct subject and recipients", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.ADMIN_NOTIFICATION_EMAILS =
      "admin1@company.com,admin2@company.com";

    await sendEmail(baseContext, baseResult);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.subject).toBe(
      "GitHub Copilot Budget Synchronization Completed"
    );
    expect(mailOptions.to).toBe("admin1@company.com,admin2@company.com");
    expect(mailOptions.from).toBe("user@example.com");
  });

  test("includes context details in the email body", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.ADMIN_NOTIFICATION_EMAILS = "admin@company.com";

    await sendEmail(baseContext, baseResult);

    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.text).toContain("acme/copilot");
    expect(mailOptions.text).toContain("acme-enterprise");
    expect(mailOptions.text).toContain("Budget Sync");
    expect(mailOptions.text).toContain("alice");
    expect(mailOptions.text).toContain("bob");
  });

  test("attaches existing report files", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.ADMIN_NOTIFICATION_EMAILS = "admin@company.com";

    jest.spyOn(fs, "existsSync").mockImplementation((filePath) =>
      filePath.endsWith("budget-report.csv")
    );

    await sendEmail(baseContext, baseResult);

    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.attachments).toHaveLength(1);
    expect(mailOptions.attachments[0].filename).toBe("budget-report.csv");

    fs.existsSync.mockRestore();
  });

  test("configures transport with port 465 as secure", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.ADMIN_NOTIFICATION_EMAILS = "admin@company.com";

    await sendEmail(baseContext, baseResult);

    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ secure: true, port: 465 })
    );
  });
});
