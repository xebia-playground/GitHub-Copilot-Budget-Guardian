const API_VERSION = "2026-03-10";

const REPORT_FORMATS = {
  MARKDOWN: "markdown",
  CSV: "csv",
  JSON: "json"
};

const STATUS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  SKIP: "SKIP",
  ERROR: "ERROR"
};

module.exports = {
  API_VERSION,
  REPORT_FORMATS,
  STATUS
};