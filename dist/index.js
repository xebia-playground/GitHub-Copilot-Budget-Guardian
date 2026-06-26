var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// src/logger.js
var require_logger = __commonJS({
  "src/logger.js"(exports2, module2) {
    var core = require("@actions/core");
    var Logger = class {
      info(message) {
        core.info(`\u2139\uFE0F ${message}`);
      }
      success(message) {
        core.info(`\u2705 ${message}`);
      }
      warning(message) {
        core.warning(`\u26A0\uFE0F ${message}`);
      }
      error(message) {
        core.error(`\u274C ${message}`);
      }
      debug(message) {
        core.debug(`\u{1F50D} ${message}`);
      }
      startGroup(title) {
        core.startGroup(`\u{1F4C2} ${title}`);
      }
      endGroup() {
        core.endGroup();
      }
      setOutput(name, value) {
        if (process.env.GITHUB_ACTIONS === "true") {
          core.setOutput(name, value);
          return;
        }
        this.info(`Output -> ${name}: ${value}`);
      }
      fail(error) {
        core.setFailed(error instanceof Error ? error.message : error);
      }
    };
    module2.exports = new Logger();
  }
});

// src/config.js
var require_config = __commonJS({
  "src/config.js"(exports2, module2) {
    var core = require("@actions/core");
    var Config = class {
      isGitHubActionsRuntime() {
        return process.env.GITHUB_ACTIONS === "true";
      }
      getLocalArg(name) {
        const flagName = `--${name}=`;
        const arg = process.argv.find(
          (item) => item.startsWith(flagName)
        );
        if (!arg) {
          return "";
        }
        return arg.slice(flagName.length);
      }
      getLocalOverride(name) {
        const envName = `COPILOT_BUDGET_GUARDIAN_${name.replace(/-/g, "_").toUpperCase()}`;
        return this.getLocalArg(name) || process.env[envName] || "";
      }
      getInput(name, required = false, defaultValue = "") {
        if (!this.isGitHubActionsRuntime()) {
          const localValue = this.getLocalOverride(name);
          if (localValue) {
            return localValue;
          }
          if (required) {
            throw new Error(
              `Missing required input for local execution: ${name}`
            );
          }
          return defaultValue;
        }
        try {
          return core.getInput(name, { required });
        } catch (_) {
          if (required) {
            throw new Error(`Missing required input: ${name}`);
          }
          return defaultValue;
        }
      }
      validateReportFormat(format) {
        const validFormats = ["markdown", "json", "csv"];
        if (!validFormats.includes(format)) {
          throw new Error(
            `Invalid report-format: ${format}

Supported formats:
- markdown
- json
- csv`
          );
        }
        return format;
      }
      validateAlertThreshold(threshold) {
        const num = Number(threshold);
        if (isNaN(num)) {
          throw new Error(
            `alert-threshold must be a number, received: ${threshold}`
          );
        }
        if (num < 0 || num > 100) {
          throw new Error(
            `alert-threshold must be between 0 and 100, received: ${num}`
          );
        }
        return num;
      }
      load() {
        const localDefaults = this.isGitHubActionsRuntime() ? {} : {
          githubToken: "local-dev-token",
          enterpriseSlug: "local-enterprise",
          budgetFile: "examples/budgets.csv",
          dryRun: "true",
          reportFormat: "markdown",
          alertThreshold: "80"
        };
        const reportFormat = this.getInput(
          "report-format",
          false,
          localDefaults.reportFormat || "markdown"
        );
        const alertThreshold = this.getInput(
          "alert-threshold",
          false,
          localDefaults.alertThreshold || "80"
        );
        return {
          githubToken: this.getInput(
            "github-token",
            !localDefaults.githubToken,
            localDefaults.githubToken || ""
          ),
          enterpriseSlug: this.getInput(
            "enterprise-slug",
            !localDefaults.enterpriseSlug,
            localDefaults.enterpriseSlug || ""
          ),
          budgetFile: this.getInput(
            "budget-file",
            false,
            localDefaults.budgetFile || "budgets.csv"
          ),
          dryRun: this.getInput(
            "dry-run",
            false,
            localDefaults.dryRun || "false"
          ) === "true",
          reportFormat: this.validateReportFormat(reportFormat),
          alertThreshold: this.validateAlertThreshold(alertThreshold),
          slackWebhook: this.getInput(
            "slack-webhook"
          ),
          teamsWebhook: this.getInput(
            "teams-webhook"
          )
        };
      }
    };
    module2.exports = new Config();
  }
});

// node_modules/csv-parse/dist/cjs/sync.cjs
var require_sync = __commonJS({
  "node_modules/csv-parse/dist/cjs/sync.cjs"(exports2) {
    "use strict";
    var CsvError = class _CsvError extends Error {
      constructor(code, message, options, ...contexts) {
        if (Array.isArray(message)) message = message.join(" ").trim();
        super(message);
        if (Error.captureStackTrace !== void 0) {
          Error.captureStackTrace(this, _CsvError);
        }
        this.code = code;
        for (const context of contexts) {
          for (const key in context) {
            const value = context[key];
            this[key] = Buffer.isBuffer(value) ? value.toString(options.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
          }
        }
      }
    };
    var is_object = function(obj) {
      return typeof obj === "object" && obj !== null && !Array.isArray(obj);
    };
    var normalize_columns_array = function(columns) {
      const normalizedColumns = [];
      for (let i = 0, l = columns.length; i < l; i++) {
        const column = columns[i];
        if (column === void 0 || column === null || column === false) {
          normalizedColumns[i] = { disabled: true };
        } else if (typeof column === "string" || typeof column === "number") {
          normalizedColumns[i] = { name: `${column}` };
        } else if (is_object(column)) {
          if (typeof column.name !== "string") {
            throw new CsvError("CSV_OPTION_COLUMNS_MISSING_NAME", [
              "Option columns missing name:",
              `property "name" is required at position ${i}`,
              "when column is an object literal"
            ]);
          }
          normalizedColumns[i] = column;
        } else {
          throw new CsvError("CSV_INVALID_COLUMN_DEFINITION", [
            "Invalid column definition:",
            "expect a string or a literal object,",
            `got ${JSON.stringify(column)} at position ${i}`
          ]);
        }
      }
      return normalizedColumns;
    };
    var ResizeableBuffer = class {
      constructor(size = 100) {
        this.size = size;
        this.length = 0;
        this.buf = Buffer.allocUnsafe(size);
      }
      prepend(val) {
        if (Buffer.isBuffer(val)) {
          const length = this.length + val.length;
          if (length >= this.size) {
            this.resize();
            if (length >= this.size) {
              throw Error("INVALID_BUFFER_STATE");
            }
          }
          const buf = this.buf;
          this.buf = Buffer.allocUnsafe(this.size);
          val.copy(this.buf, 0);
          buf.copy(this.buf, val.length);
          this.length += val.length;
        } else {
          const length = this.length++;
          if (length === this.size) {
            this.resize();
          }
          const buf = this.clone();
          this.buf[0] = val;
          buf.copy(this.buf, 1, 0, length);
        }
      }
      append(val) {
        const length = this.length++;
        if (length === this.size) {
          this.resize();
        }
        this.buf[length] = val;
      }
      clone() {
        return Buffer.from(this.buf.slice(0, this.length));
      }
      resize() {
        const length = this.length;
        this.size = this.size * 2;
        const buf = Buffer.allocUnsafe(this.size);
        this.buf.copy(buf, 0, 0, length);
        this.buf = buf;
      }
      toString(encoding) {
        if (encoding) {
          return this.buf.slice(0, this.length).toString(encoding);
        } else {
          return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
        }
      }
      toJSON() {
        return this.toString("utf8");
      }
      reset() {
        this.length = 0;
      }
    };
    var init_state = function(options) {
      const timchars = [
        // Basic Latin
        32,
        // [Space](https://www.fileformat.info/info/unicode/char/0020/index.htm)
        9,
        // [CHARACTER TABULATION (HT)](https://www.fileformat.info/info/unicode/char/0009/index.htm)
        10,
        // [LINE FEED (LF)](https://www.fileformat.info/info/unicode/char/000a/index.htm)
        13,
        // [CARRIAGE RETURN (CR)](https://www.fileformat.info/info/unicode/char/000d/index.htm)
        12,
        // [FORM FEED (FF)](https://www.fileformat.info/info/unicode/char/000c/index.htm)
        11,
        // [LINE TABULATION (VT)](https://www.fileformat.info/info/unicode/char/000b/index.htm)
        // Latin-1 Supplement
        160,
        // [NO-BREAK SPACE (NBSP)](https://www.fileformat.info/info/unicode/char/00a0/index.htm)
        // Ogham
        5760,
        // [OGHAM SPACE MARK](https://www.fileformat.info/info/unicode/char/1680/index.htm)
        // General Punctuation
        8192,
        // [EN QUAD](https://www.fileformat.info/info/unicode/char/2000/index.htm)
        8193,
        // [EM QUAD](https://www.fileformat.info/info/unicode/char/2001/index.htm)
        8194,
        // [EN SPACE](https://www.fileformat.info/info/unicode/char/2002/index.htm)
        8195,
        // [EM SPACE](https://www.fileformat.info/info/unicode/char/2003/index.htm)
        8196,
        // [THREE-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2004/index.htm)
        8197,
        // [FOUR-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2005/index.htm)
        8198,
        // [SIX-PER-EM SPACE](https://www.fileformat.info/info/unicode/char/2006/index.htm)
        8199,
        // [FIGURE SPACE](https://www.fileformat.info/info/unicode/char/2007/index.htm)
        8200,
        // [PUNCTUATION SPACE](https://www.fileformat.info/info/unicode/char/2008/index.htm)
        8201,
        // [THIN SPACE](https://www.fileformat.info/info/unicode/char/2009/index.htm)
        8202,
        // [HAIR SPACE](https://www.fileformat.info/info/unicode/char/200a/index.htm)
        8232,
        // [LINE SEPARATOR](https://www.fileformat.info/info/unicode/char/2028/index.htm)
        8233,
        // [PARAGRAPH SEPARATOR](https://www.fileformat.info/info/unicode/char/2029/index.htm)
        8239,
        // [NARROW NO-BREAK SPACE (NNBSP)](https://www.fileformat.info/info/unicode/char/202f/index.htm)
        8287,
        // [MEDIUM MATHEMATICAL SPACE (MMSP)](https://www.fileformat.info/info/unicode/char/205f/index.htm)
        12288,
        // [IDEOGRAPHIC SPACE](https://www.fileformat.info/info/unicode/char/3000/index.htm)
        65279
        // [ZERO WIDTH NO-BREAK SPACE (BOM)](https://www.fileformat.info/info/unicode/char/feff/index.htm)
      ].reduce((acc, codepoint) => {
        const encoded = Buffer.from(
          String.fromCharCode(codepoint),
          options.encoding
        );
        if (codepoint !== 63 && encoded.length === 1 && encoded[0] === 63) {
          return acc;
        }
        acc.push(encoded);
        return acc;
      }, []);
      const timcharFirstBytes = new Uint8Array(256);
      for (const t of timchars) timcharFirstBytes[t[0]] = 1;
      return {
        bomSkipped: false,
        bufBytesStart: 0,
        castField: options.cast_function,
        commenting: false,
        delimiterBufPrevious: void 0,
        delimiterDiscovered: false,
        // Current error encountered by a record
        error: void 0,
        enabled: options.from_line === 1,
        escaping: false,
        escapeIsQuote: Buffer.isBuffer(options.escape) && Buffer.isBuffer(options.quote) && Buffer.compare(options.escape, options.quote) === 0,
        // columns can be `false`, `true`, `Array`
        expectedRecordLength: Array.isArray(options.columns) ? options.columns.length : void 0,
        field: new ResizeableBuffer(20),
        firstLineToHeaders: options.cast_first_line_to_header,
        needMoreDataSize: Math.max(
          // Skip if the remaining buffer smaller than comment
          options.comment !== null ? options.comment.length : 0,
          ...options.delimiter ? options.delimiter.map((delimiter) => delimiter.length) : [],
          // Auto discovery of delimiter is limited to 1 character
          options.delimiter_auto ? 1 : 0,
          // Skip if the remaining buffer can be escape sequence
          options.quote !== null ? options.quote.length : 0,
          ...timchars.map((t) => t.length)
        ),
        previousBuf: void 0,
        quoting: false,
        stop: false,
        rawBuffer: new ResizeableBuffer(100),
        record: [],
        recordHasError: false,
        record_length: 0,
        recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 0 : Math.max(...options.record_delimiter.map((v) => v.length)),
        trimChars: [
          Buffer.from(" ", options.encoding)[0],
          Buffer.from("	", options.encoding)[0]
        ],
        wasQuoting: false,
        wasRowDelimiter: false,
        timchars,
        timcharFirstBytes
      };
    };
    var underscore = function(str) {
      return str.replace(/([A-Z])/g, function(_, match) {
        return "_" + match.toLowerCase();
      });
    };
    var normalize_options = function(opts) {
      const options = {};
      for (const opt in opts) {
        options[underscore(opt)] = opts[opt];
      }
      if (options.encoding === void 0 || options.encoding === true) {
        options.encoding = "utf8";
      } else if (options.encoding === null || options.encoding === false) {
        options.encoding = null;
      } else if (typeof options.encoding !== "string" && options.encoding !== null) {
        throw new CsvError(
          "CSV_INVALID_OPTION_ENCODING",
          [
            "Invalid option encoding:",
            "encoding must be a string or null to return a buffer,",
            `got ${JSON.stringify(options.encoding)}`
          ],
          options
        );
      }
      if (options.bom === void 0 || options.bom === null || options.bom === false) {
        options.bom = false;
      } else if (options.bom !== true) {
        throw new CsvError(
          "CSV_INVALID_OPTION_BOM",
          [
            "Invalid option bom:",
            "bom must be true,",
            `got ${JSON.stringify(options.bom)}`
          ],
          options
        );
      }
      options.cast_function = null;
      if (options.cast === void 0 || options.cast === null || options.cast === false || options.cast === "") {
        options.cast = void 0;
      } else if (typeof options.cast === "function") {
        options.cast_function = options.cast;
        options.cast = true;
      } else if (options.cast !== true) {
        throw new CsvError(
          "CSV_INVALID_OPTION_CAST",
          [
            "Invalid option cast:",
            "cast must be true or a function,",
            `got ${JSON.stringify(options.cast)}`
          ],
          options
        );
      }
      if (options.cast_date === void 0 || options.cast_date === null || options.cast_date === false || options.cast_date === "") {
        options.cast_date = false;
      } else if (options.cast_date === true) {
        options.cast_date = function(value) {
          const date = Date.parse(value);
          return !isNaN(date) ? new Date(date) : value;
        };
      } else if (typeof options.cast_date !== "function") {
        throw new CsvError(
          "CSV_INVALID_OPTION_CAST_DATE",
          [
            "Invalid option cast_date:",
            "cast_date must be true or a function,",
            `got ${JSON.stringify(options.cast_date)}`
          ],
          options
        );
      }
      options.cast_first_line_to_header = void 0;
      if (options.columns === true) {
        options.cast_first_line_to_header = void 0;
      } else if (typeof options.columns === "function") {
        options.cast_first_line_to_header = options.columns;
        options.columns = true;
      } else if (Array.isArray(options.columns)) {
        options.columns = normalize_columns_array(options.columns);
      } else if (options.columns === void 0 || options.columns === null || options.columns === false) {
        options.columns = false;
      } else {
        throw new CsvError(
          "CSV_INVALID_OPTION_COLUMNS",
          [
            "Invalid option columns:",
            "expect an array, a function or true,",
            `got ${JSON.stringify(options.columns)}`
          ],
          options
        );
      }
      if (options.group_columns_by_name === void 0 || options.group_columns_by_name === null || options.group_columns_by_name === false) {
        options.group_columns_by_name = false;
      } else if (options.group_columns_by_name !== true) {
        throw new CsvError(
          "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
          [
            "Invalid option group_columns_by_name:",
            "expect an boolean,",
            `got ${JSON.stringify(options.group_columns_by_name)}`
          ],
          options
        );
      } else if (options.columns === false) {
        throw new CsvError(
          "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
          [
            "Invalid option group_columns_by_name:",
            "the `columns` mode must be activated."
          ],
          options
        );
      }
      if (options.comment === void 0 || options.comment === null || options.comment === false || options.comment === "") {
        options.comment = null;
      } else {
        if (typeof options.comment === "string") {
          options.comment = Buffer.from(options.comment, options.encoding);
        }
        if (!Buffer.isBuffer(options.comment)) {
          throw new CsvError(
            "CSV_INVALID_OPTION_COMMENT",
            [
              "Invalid option comment:",
              "comment must be a buffer or a string,",
              `got ${JSON.stringify(options.comment)}`
            ],
            options
          );
        }
      }
      if (options.comment_no_infix === void 0 || options.comment_no_infix === null || options.comment_no_infix === false) {
        options.comment_no_infix = false;
      } else if (options.comment_no_infix !== true) {
        throw new CsvError(
          "CSV_INVALID_OPTION_COMMENT",
          [
            "Invalid option comment_no_infix:",
            "value must be a boolean,",
            `got ${JSON.stringify(options.comment_no_infix)}`
          ],
          options
        );
      }
      if (options.delimiter_auto === void 0 || options.delimiter_auto === null || options.delimiter_auto === false) {
        options.delimiter_auto = false;
      } else if (options.delimiter_auto === true) {
        options.delimiter_auto = {};
      } else if (!is_object(options.delimiter_auto)) {
        throw new CsvError(
          "CSV_INVALID_OPTION_DELIMITER_AUTO",
          [
            "Invalid option delimiter_auto:",
            "delimiter_auto must be a boolean or a configuration object,",
            `got ${JSON.stringify(options.delimiter_auto)}`
          ],
          options
        );
      }
      if (options.delimiter_auto) {
        if (options.delimiter_auto.preferred === void 0)
          options.delimiter_auto.preferred = {
            [",".charCodeAt(0)]: 1.8,
            ["	".charCodeAt(0)]: 1.8,
            [";".charCodeAt(0)]: 1.6,
            [" ".charCodeAt(0)]: 1.6,
            [":".charCodeAt(0)]: 1.5,
            [".".charCodeAt(0)]: 1.4,
            ["/".charCodeAt(0)]: 1.4
          };
        else if (!is_object(options.delimiter_auto.preferred)) {
          throw new CsvError(
            "CSV_INVALID_OPTION_DELIMITER_AUTO",
            [
              "Invalid option delimiter_auto:",
              "preferred must be an object,",
              `got ${JSON.stringify(options.delimiter_auto.preferred)}`
            ],
            options
          );
        }
        if (options.delimiter_auto.score === void 0)
          options.delimiter_auto.score = (info, options2) => {
            return (info.total - info.std) * (options2.preferred[info.char_code] || 1);
          };
        else if (typeof options.delimiter_auto.score !== "function") {
          throw new CsvError(
            "CSV_INVALID_OPTION_DELIMITER_AUTO",
            [
              "Invalid option delimiter_auto:",
              "score must be a function,",
              `got ${JSON.stringify(options.delimiter_auto.score)}`
            ],
            options
          );
        }
        if (options.delimiter_auto.size === void 0)
          options.delimiter_auto.size = 2048;
        else if (typeof options.delimiter_auto.size !== "number") {
          throw new CsvError(
            "CSV_INVALID_OPTION_DELIMITER_AUTO",
            [
              "Invalid option delimiter_auto:",
              "size must be a number,",
              `got ${JSON.stringify(options.delimiter_auto.size)}`
            ],
            options
          );
        }
      }
      const delimiter_json = JSON.stringify(options.delimiter);
      if (options.delimiter_auto !== false) {
        options.delimiter = [];
      }
      if (!Array.isArray(options.delimiter)) {
        if (options.delimiter === void 0 || options.delimiter === null || options.delimiter === false) {
          options.delimiter = Buffer.from(",", options.encoding);
        }
        options.delimiter = [options.delimiter];
      }
      options.delimiter = options.delimiter.map(function(delimiter) {
        if (typeof delimiter === "string") {
          delimiter = Buffer.from(delimiter, options.encoding);
        }
        if (!Buffer.isBuffer(delimiter) || delimiter.length === 0) {
          throw new CsvError(
            "CSV_INVALID_OPTION_DELIMITER",
            [
              "Invalid option delimiter:",
              "delimiter must be a non empty string or buffer or array of string|buffer,",
              `got ${delimiter_json}`
            ],
            options
          );
        }
        return delimiter;
      });
      if (options.escape === void 0 || options.escape === true) {
        options.escape = Buffer.from('"', options.encoding);
      } else if (typeof options.escape === "string") {
        options.escape = Buffer.from(options.escape, options.encoding);
      } else if (options.escape === null || options.escape === false) {
        options.escape = null;
      }
      if (options.escape !== null) {
        if (!Buffer.isBuffer(options.escape)) {
          throw new Error(
            `Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`
          );
        }
      }
      if (options.from === void 0 || options.from === null) {
        options.from = 1;
      } else {
        if (typeof options.from === "string" && /\d+/.test(options.from)) {
          options.from = parseInt(options.from);
        }
        if (Number.isInteger(options.from)) {
          if (options.from < 0) {
            throw new Error(
              `Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`
            );
          }
        } else {
          throw new Error(
            `Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`
          );
        }
      }
      if (options.from_line === void 0 || options.from_line === null) {
        options.from_line = 1;
      } else {
        if (typeof options.from_line === "string" && /\d+/.test(options.from_line)) {
          options.from_line = parseInt(options.from_line);
        }
        if (Number.isInteger(options.from_line)) {
          if (options.from_line <= 0) {
            throw new Error(
              `Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`
            );
          }
        } else {
          throw new Error(
            `Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`
          );
        }
      }
      if (options.ignore_last_delimiters === void 0 || options.ignore_last_delimiters === null) {
        options.ignore_last_delimiters = false;
      } else if (typeof options.ignore_last_delimiters === "number") {
        options.ignore_last_delimiters = Math.floor(options.ignore_last_delimiters);
        if (options.ignore_last_delimiters === 0) {
          options.ignore_last_delimiters = false;
        }
      } else if (typeof options.ignore_last_delimiters !== "boolean") {
        throw new CsvError(
          "CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS",
          [
            "Invalid option `ignore_last_delimiters`:",
            "the value must be a boolean value or an integer,",
            `got ${JSON.stringify(options.ignore_last_delimiters)}`
          ],
          options
        );
      }
      if (options.ignore_last_delimiters === true && options.columns === false) {
        throw new CsvError(
          "CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS",
          [
            "The option `ignore_last_delimiters`",
            "requires the activation of the `columns` option"
          ],
          options
        );
      }
      if (options.info === void 0 || options.info === null || options.info === false) {
        options.info = false;
      } else if (options.info !== true) {
        throw new Error(
          `Invalid Option: info must be true, got ${JSON.stringify(options.info)}`
        );
      }
      if (options.max_record_size === void 0 || options.max_record_size === null || options.max_record_size === false) {
        options.max_record_size = 0;
      } else if (Number.isInteger(options.max_record_size) && options.max_record_size >= 0) ;
      else if (typeof options.max_record_size === "string" && /\d+/.test(options.max_record_size)) {
        options.max_record_size = parseInt(options.max_record_size);
      } else {
        throw new Error(
          `Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`
        );
      }
      if (options.objname === void 0 || options.objname === null || options.objname === false) {
        options.objname = void 0;
      } else if (Buffer.isBuffer(options.objname)) {
        if (options.objname.length === 0) {
          throw new Error(`Invalid Option: objname must be a non empty buffer`);
        }
        if (options.encoding === null) ;
        else {
          options.objname = options.objname.toString(options.encoding);
        }
      } else if (typeof options.objname === "string") {
        if (options.objname.length === 0) {
          throw new Error(`Invalid Option: objname must be a non empty string`);
        }
      } else if (typeof options.objname === "number") ;
      else {
        throw new Error(
          `Invalid Option: objname must be a string or a buffer, got ${options.objname}`
        );
      }
      if (options.objname !== void 0) {
        if (typeof options.objname === "number") {
          if (options.columns !== false) {
            throw Error(
              "Invalid Option: objname index cannot be combined with columns or be defined as a field"
            );
          }
        } else {
          if (options.columns === false) {
            throw Error(
              "Invalid Option: objname field must be combined with columns or be defined as an index"
            );
          }
        }
      }
      if (options.on_record === void 0 || options.on_record === null) {
        options.on_record = void 0;
      } else if (typeof options.on_record !== "function") {
        throw new CsvError(
          "CSV_INVALID_OPTION_ON_RECORD",
          [
            "Invalid option `on_record`:",
            "expect a function,",
            `got ${JSON.stringify(options.on_record)}`
          ],
          options
        );
      }
      if (options.on_skip !== void 0 && options.on_skip !== null && typeof options.on_skip !== "function") {
        throw new Error(
          `Invalid Option: on_skip must be a function, got ${JSON.stringify(options.on_skip)}`
        );
      }
      if (options.quote === null || options.quote === false || options.quote === "") {
        options.quote = null;
      } else {
        if (options.quote === void 0 || options.quote === true) {
          options.quote = Buffer.from('"', options.encoding);
        } else if (typeof options.quote === "string") {
          options.quote = Buffer.from(options.quote, options.encoding);
        }
        if (!Buffer.isBuffer(options.quote)) {
          throw new Error(
            `Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`
          );
        }
      }
      if (options.raw === void 0 || options.raw === null || options.raw === false) {
        options.raw = false;
      } else if (options.raw !== true) {
        throw new Error(
          `Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`
        );
      }
      if (options.record_delimiter === void 0) {
        options.record_delimiter = [];
      } else if (typeof options.record_delimiter === "string" || Buffer.isBuffer(options.record_delimiter)) {
        if (options.record_delimiter.length === 0) {
          throw new CsvError(
            "CSV_INVALID_OPTION_RECORD_DELIMITER",
            [
              "Invalid option `record_delimiter`:",
              "value must be a non empty string or buffer,",
              `got ${JSON.stringify(options.record_delimiter)}`
            ],
            options
          );
        }
        options.record_delimiter = [options.record_delimiter];
      } else if (!Array.isArray(options.record_delimiter)) {
        throw new CsvError(
          "CSV_INVALID_OPTION_RECORD_DELIMITER",
          [
            "Invalid option `record_delimiter`:",
            "value must be a string, a buffer or array of string|buffer,",
            `got ${JSON.stringify(options.record_delimiter)}`
          ],
          options
        );
      }
      options.record_delimiter = options.record_delimiter.map(function(rd, i) {
        if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
          throw new CsvError(
            "CSV_INVALID_OPTION_RECORD_DELIMITER",
            [
              "Invalid option `record_delimiter`:",
              "value must be a string, a buffer or array of string|buffer",
              `at index ${i},`,
              `got ${JSON.stringify(rd)}`
            ],
            options
          );
        } else if (rd.length === 0) {
          throw new CsvError(
            "CSV_INVALID_OPTION_RECORD_DELIMITER",
            [
              "Invalid option `record_delimiter`:",
              "value must be a non empty string or buffer",
              `at index ${i},`,
              `got ${JSON.stringify(rd)}`
            ],
            options
          );
        }
        if (typeof rd === "string") {
          rd = Buffer.from(rd, options.encoding);
        }
        return rd;
      });
      if (typeof options.relax_column_count === "boolean") ;
      else if (options.relax_column_count === void 0 || options.relax_column_count === null) {
        options.relax_column_count = false;
      } else {
        throw new Error(
          `Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`
        );
      }
      if (typeof options.relax_column_count_less === "boolean") ;
      else if (options.relax_column_count_less === void 0 || options.relax_column_count_less === null) {
        options.relax_column_count_less = false;
      } else {
        throw new Error(
          `Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`
        );
      }
      if (typeof options.relax_column_count_more === "boolean") ;
      else if (options.relax_column_count_more === void 0 || options.relax_column_count_more === null) {
        options.relax_column_count_more = false;
      } else {
        throw new Error(
          `Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`
        );
      }
      if (typeof options.relax_quotes === "boolean") ;
      else if (options.relax_quotes === void 0 || options.relax_quotes === null) {
        options.relax_quotes = false;
      } else {
        throw new Error(
          `Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options.relax_quotes)}`
        );
      }
      if (typeof options.skip_empty_lines === "boolean") ;
      else if (options.skip_empty_lines === void 0 || options.skip_empty_lines === null) {
        options.skip_empty_lines = false;
      } else {
        throw new Error(
          `Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`
        );
      }
      if (typeof options.skip_records_with_empty_values === "boolean") ;
      else if (options.skip_records_with_empty_values === void 0 || options.skip_records_with_empty_values === null) {
        options.skip_records_with_empty_values = false;
      } else {
        throw new Error(
          `Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_records_with_empty_values)}`
        );
      }
      if (typeof options.skip_records_with_error === "boolean") ;
      else if (options.skip_records_with_error === void 0 || options.skip_records_with_error === null) {
        options.skip_records_with_error = false;
      } else {
        throw new Error(
          `Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options.skip_records_with_error)}`
        );
      }
      if (options.rtrim === void 0 || options.rtrim === null || options.rtrim === false) {
        options.rtrim = false;
      } else if (options.rtrim !== true) {
        throw new Error(
          `Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`
        );
      }
      if (options.ltrim === void 0 || options.ltrim === null || options.ltrim === false) {
        options.ltrim = false;
      } else if (options.ltrim !== true) {
        throw new Error(
          `Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`
        );
      }
      if (options.trim === void 0 || options.trim === null || options.trim === false) {
        options.trim = false;
      } else if (options.trim !== true) {
        throw new Error(
          `Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`
        );
      }
      if (options.trim === true && opts.ltrim !== false) {
        options.ltrim = true;
      } else if (options.ltrim !== true) {
        options.ltrim = false;
      }
      if (options.trim === true && opts.rtrim !== false) {
        options.rtrim = true;
      } else if (options.rtrim !== true) {
        options.rtrim = false;
      }
      if (options.to === void 0 || options.to === null) {
        options.to = -1;
      } else if (options.to !== -1) {
        if (typeof options.to === "string" && /\d+/.test(options.to)) {
          options.to = parseInt(options.to);
        }
        if (Number.isInteger(options.to)) {
          if (options.to <= 0) {
            throw new Error(
              `Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`
            );
          }
        } else {
          throw new Error(
            `Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`
          );
        }
      }
      if (options.to_line === void 0 || options.to_line === null) {
        options.to_line = -1;
      } else if (options.to_line !== -1) {
        if (typeof options.to_line === "string" && /\d+/.test(options.to_line)) {
          options.to_line = parseInt(options.to_line);
        }
        if (Number.isInteger(options.to_line)) {
          if (options.to_line <= 0) {
            throw new Error(
              `Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`
            );
          }
        } else {
          throw new Error(
            `Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`
          );
        }
      }
      return options;
    };
    var delimiter_discover = function(records, options) {
      if (!options) {
        ({ delimiter_auto: options } = normalize_options({ delimiter_auto: true }));
      }
      if (typeof records === "string") {
        records = Buffer.from(records);
      }
      if (Buffer.isBuffer(records)) {
        records = ((data) => {
          const records2 = [];
          const parser = transform({ delimiter: [] });
          const push = (record) => records2.push(record);
          const close = () => {
          };
          const error = parser.parse(data, true, push, close);
          if (error !== void 0) throw error;
          return records2;
        })(records);
      }
      const info = Array(127).fill().map(() => ({ lines: [] }));
      records.map(([record], line) => {
        for (let i = 0, l = record.length; i < l; i++) {
          const code = record.charCodeAt(i);
          if (info[code].lines[line] === void 0) info[code].lines[line] = 0;
          info[code].lines[line]++;
        }
      });
      info.map((info2, i) => {
        info2.char_code = i;
        info2.std = std(info2.lines);
        info2.total = info2.lines.reduce((acc, val) => acc + val, 0);
        info2.preferred = !!options.preferred[i];
        info2.score = options.score(info2, options);
      });
      const result = info.reduce(
        (acc, info2) => acc.score > info2.score ? acc : info2,
        {}
      );
      return String.fromCharCode(result.char_code);
    };
    var std = function(array) {
      const n = array.length;
      if (n === 0) return 0;
      const mean = array.reduce((a, b) => a + b) / n;
      return Math.sqrt(
        array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
      );
    };
    var isRecordEmpty = function(record) {
      return record.every(
        (field) => field == null || field.toString && field.toString().trim() === ""
      );
    };
    var cr = 13;
    var nl = 10;
    var boms = {
      // Note, the following are equals:
      // Buffer.from("\ufeff")
      // Buffer.from([239, 187, 191])
      // Buffer.from('EFBBBF', 'hex')
      utf8: Buffer.from([239, 187, 191]),
      // Note, the following are equals:
      // Buffer.from "\ufeff", 'utf16le
      // Buffer.from([255, 254])
      utf16le: Buffer.from([255, 254])
    };
    var transform = function(original_options = {}) {
      const info = {
        bytes: 0,
        bytes_records: 0,
        comment_lines: 0,
        empty_lines: 0,
        invalid_field_length: 0,
        lines: 1,
        records: 0
      };
      const options = normalize_options(original_options);
      return {
        info,
        original_options,
        options,
        state: init_state(options),
        __needMoreData: function(i, bufLen, end) {
          if (end) return false;
          const { encoding, escape, quote } = this.options;
          const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
          const numOfCharLeft = bufLen - i - 1;
          const requiredLength = Math.max(
            needMoreDataSize,
            // Skip if the remaining buffer smaller than record delimiter
            // If "record_delimiter" is yet to be discovered:
            // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
            // 2. We set the length to windows line ending in the current encoding
            // Note, that encoding is known from user or bom discovery at that point
            // recordDelimiterMaxLength,
            recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
            // Skip if remaining buffer can be an escaped quote
            quoting ? (escape === null ? 0 : escape.length) + quote.length : 0,
            // Skip if remaining buffer can be record delimiter following the closing quote
            quoting ? quote.length + recordDelimiterMaxLength : 0
          );
          return numOfCharLeft < requiredLength;
        },
        // Central parser implementation
        parse: function(nextBuf, end, push, close) {
          const {
            bom,
            comment_no_infix,
            delimiter_auto,
            encoding,
            from_line,
            ltrim,
            max_record_size,
            raw,
            relax_quotes,
            rtrim,
            skip_empty_lines,
            to,
            to_line
          } = this.options;
          let { comment, escape, quote, record_delimiter } = this.options;
          const {
            bomSkipped,
            delimiterDiscovered,
            delimiterBufPrevious,
            rawBuffer,
            escapeIsQuote
          } = this.state;
          if (!delimiterDiscovered && delimiter_auto) {
            let delimiterBuf;
            if (delimiterBufPrevious === void 0) {
              delimiterBuf = nextBuf;
            } else if (delimiterBufPrevious !== void 0 && nextBuf === void 0) {
              delimiterBuf = delimiterBufPrevious;
            } else {
              delimiterBuf = Buffer.concat([delimiterBufPrevious, nextBuf]);
            }
            nextBuf = void 0;
            if (end || delimiterBuf.length > delimiter_auto.size) {
              this.options.delimiter = [
                Buffer.from(
                  delimiter_discover(delimiterBuf, this.options.delimiter_auto)
                )
              ];
              this.state.previousBuf = delimiterBuf;
              this.state.delimiterBufPrevious = void 0;
              this.state.delimiterDiscovered = true;
            } else {
              this.state.delimiterBufPrevious = delimiterBuf;
              return;
            }
          }
          const { previousBuf } = this.state;
          let buf;
          if (previousBuf === void 0) {
            if (nextBuf === void 0) {
              close();
              return;
            } else {
              buf = nextBuf;
            }
          } else if (previousBuf !== void 0 && nextBuf === void 0) {
            buf = previousBuf;
          } else {
            buf = Buffer.concat([previousBuf, nextBuf]);
          }
          if (bomSkipped === false) {
            if (bom === false) {
              this.state.bomSkipped = true;
            } else if (buf.length < 3) {
              if (end === false) {
                this.state.previousBuf = buf;
                return;
              }
            } else {
              for (const encoding2 in boms) {
                if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
                  const bomLength = boms[encoding2].length;
                  this.state.bufBytesStart += bomLength;
                  buf = buf.slice(bomLength);
                  const options2 = normalize_options({
                    ...this.original_options,
                    encoding: encoding2
                  });
                  for (const key in options2) {
                    this.options[key] = options2[key];
                  }
                  ({ comment, escape, quote } = this.options);
                  break;
                }
              }
              this.state.bomSkipped = true;
            }
          }
          const bufLen = buf.length;
          let pos;
          for (pos = 0; pos < bufLen; pos++) {
            if (this.__needMoreData(pos, bufLen, end)) {
              break;
            }
            if (this.state.wasRowDelimiter === true) {
              this.info.lines++;
              this.state.wasRowDelimiter = false;
            }
            if (to_line !== -1 && this.info.lines > to_line) {
              this.state.stop = true;
              close();
              return;
            }
            if (this.state.quoting === false && record_delimiter.length === 0) {
              const record_delimiterCount = this.__autoDiscoverRecordDelimiter(
                buf,
                pos
              );
              if (record_delimiterCount) {
                record_delimiter = this.options.record_delimiter;
              }
            }
            const chr = buf[pos];
            if (raw === true) {
              rawBuffer.append(chr);
            }
            if ((chr === cr || chr === nl) && this.state.wasRowDelimiter === false) {
              this.state.wasRowDelimiter = true;
            }
            if (this.state.escaping === true) {
              this.state.escaping = false;
            } else {
              if (escape !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape.length < bufLen) {
                if (escapeIsQuote) {
                  if (this.__isQuote(buf, pos + escape.length)) {
                    this.state.escaping = true;
                    pos += escape.length - 1;
                    continue;
                  }
                } else {
                  this.state.escaping = true;
                  pos += escape.length - 1;
                  continue;
                }
              }
              if (this.state.commenting === false && this.__isQuote(buf, pos)) {
                if (this.state.quoting === true) {
                  const nextChr = buf[pos + quote.length];
                  const isNextChrTrimable = rtrim && this.__isCharTrimable(buf, pos + quote.length);
                  const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
                  const isNextChrDelimiter = this.__isDelimiter(
                    buf,
                    pos + quote.length,
                    nextChr
                  );
                  const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
                  if (escape !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape.length)) {
                    pos += escape.length - 1;
                  } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                    this.state.quoting = false;
                    this.state.wasQuoting = true;
                    pos += quote.length - 1;
                    continue;
                  } else if (relax_quotes === false) {
                    const err = this.__error(
                      new CsvError(
                        "CSV_INVALID_CLOSING_QUOTE",
                        [
                          "Invalid Closing Quote:",
                          `got "${String.fromCharCode(nextChr)}"`,
                          `at line ${this.info.lines}`,
                          "instead of delimiter, record delimiter, trimable character",
                          "(if activated) or comment"
                        ],
                        this.options,
                        this.__infoField()
                      )
                    );
                    if (err !== void 0) return err;
                  } else {
                    this.state.quoting = false;
                    this.state.wasQuoting = true;
                    this.state.field.prepend(quote);
                    pos += quote.length - 1;
                  }
                } else {
                  if (this.state.field.length !== 0) {
                    if (relax_quotes === false) {
                      const info2 = this.__infoField();
                      const bom2 = Object.keys(boms).map(
                        (b) => boms[b].equals(this.state.field.toString()) ? b : false
                      ).filter(Boolean)[0];
                      const err = this.__error(
                        new CsvError(
                          "INVALID_OPENING_QUOTE",
                          [
                            "Invalid Opening Quote:",
                            `a quote is found on field ${JSON.stringify(info2.column)} at line ${info2.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                            bom2 ? `(${bom2} bom)` : void 0
                          ],
                          this.options,
                          info2,
                          {
                            field: this.state.field
                          }
                        )
                      );
                      if (err !== void 0) return err;
                    }
                  } else {
                    this.state.quoting = true;
                    pos += quote.length - 1;
                    continue;
                  }
                }
              }
              if (this.state.quoting === false) {
                const recordDelimiterLength = this.__isRecordDelimiter(
                  chr,
                  buf,
                  pos
                );
                if (recordDelimiterLength !== 0) {
                  const skipCommentLine = this.state.commenting && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0;
                  if (skipCommentLine) {
                    this.info.comment_lines++;
                  } else {
                    if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                      this.state.enabled = true;
                      this.__resetField();
                      this.__resetRecord();
                      pos += recordDelimiterLength - 1;
                      continue;
                    }
                    if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                      this.info.empty_lines++;
                      pos += recordDelimiterLength - 1;
                      continue;
                    }
                    this.info.bytes = this.state.bufBytesStart + pos;
                    const errField = this.__onField();
                    if (errField !== void 0) return errField;
                    this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                    const errRecord = this.__onRecord(push);
                    if (errRecord !== void 0) return errRecord;
                    if (to !== -1 && this.info.records >= to) {
                      this.state.stop = true;
                      close();
                      return;
                    }
                  }
                  this.state.commenting = false;
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                if (this.state.commenting) {
                  continue;
                }
                if (comment !== null && (comment_no_infix === false || this.state.record.length === 0 && this.state.field.length === 0)) {
                  const commentCount = this.__compareBytes(comment, buf, pos, chr);
                  if (commentCount !== 0) {
                    this.state.commenting = true;
                    continue;
                  }
                }
                const delimiterLength = this.__isDelimiter(buf, pos, chr);
                if (delimiterLength !== 0) {
                  this.info.bytes = this.state.bufBytesStart + pos;
                  const errField = this.__onField();
                  if (errField !== void 0) return errField;
                  pos += delimiterLength - 1;
                  continue;
                }
              }
            }
            if (this.state.commenting === false) {
              if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
                return this.__error(
                  new CsvError(
                    "CSV_MAX_RECORD_SIZE",
                    [
                      "Max Record Size:",
                      "record exceed the maximum number of tolerated bytes",
                      `of ${max_record_size}`,
                      `at line ${this.info.lines}`
                    ],
                    this.options,
                    this.__infoField()
                  )
                );
              }
            }
            const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
            const rappend = rtrim === false || this.state.wasQuoting === false;
            if (lappend === true && rappend === true) {
              this.state.field.append(chr);
            } else if (rtrim === true && !this.__isCharTrimable(buf, pos)) {
              return this.__error(
                new CsvError(
                  "CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE",
                  [
                    "Invalid Closing Quote:",
                    "found non trimable byte after quote",
                    `at line ${this.info.lines}`
                  ],
                  this.options,
                  this.__infoField()
                )
              );
            } else {
              if (lappend === false) {
                pos += this.__isCharTrimable(buf, pos) - 1;
              }
              continue;
            }
          }
          if (end === true) {
            if (this.state.quoting === true) {
              const err = this.__error(
                new CsvError(
                  "CSV_QUOTE_NOT_CLOSED",
                  [
                    "Quote Not Closed:",
                    `the parsing is finished with an opening quote at line ${this.info.lines}`
                  ],
                  this.options,
                  this.__infoField()
                )
              );
              if (err !== void 0) return err;
            } else {
              if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
                this.info.bytes = this.state.bufBytesStart + pos;
                const errField = this.__onField();
                if (errField !== void 0) return errField;
                const errRecord = this.__onRecord(push);
                if (errRecord !== void 0) return errRecord;
              } else if (this.state.wasRowDelimiter === true) {
                this.info.empty_lines++;
              } else if (this.state.commenting === true) {
                this.info.comment_lines++;
              }
            }
          } else {
            this.state.bufBytesStart += pos;
            this.state.previousBuf = buf.slice(pos);
          }
          if (this.state.wasRowDelimiter === true) {
            this.info.lines++;
            this.state.wasRowDelimiter = false;
          }
        },
        __onRecord: function(push) {
          const {
            columns,
            group_columns_by_name,
            encoding,
            info: info2,
            from,
            relax_column_count,
            relax_column_count_less,
            relax_column_count_more,
            raw,
            skip_records_with_empty_values
          } = this.options;
          const { enabled, record } = this.state;
          if (enabled === false) {
            return this.__resetRecord();
          }
          const recordLength = record.length;
          if (columns === true) {
            if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
              this.__resetRecord();
              return;
            }
            return this.__firstLineToColumns(record);
          }
          if (columns === false && this.info.records === 0) {
            this.state.expectedRecordLength = recordLength;
          }
          if (recordLength !== this.state.expectedRecordLength) {
            const err = columns === false ? new CsvError(
              "CSV_RECORD_INCONSISTENT_FIELDS_LENGTH",
              [
                "Invalid Record Length:",
                `expect ${this.state.expectedRecordLength},`,
                `got ${recordLength} on line ${this.info.lines}`
              ],
              this.options,
              this.__infoField(),
              {
                record
              }
            ) : new CsvError(
              "CSV_RECORD_INCONSISTENT_COLUMNS",
              [
                "Invalid Record Length:",
                `columns length is ${columns.length},`,
                // rename columns
                `got ${recordLength} on line ${this.info.lines}`
              ],
              this.options,
              this.__infoField(),
              {
                record
              }
            );
            if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
              this.info.invalid_field_length++;
              this.state.error = err;
            } else {
              const finalErr = this.__error(err);
              if (finalErr) return finalErr;
            }
          }
          if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
            this.__resetRecord();
            return;
          }
          if (this.state.recordHasError === true) {
            this.__resetRecord();
            this.state.recordHasError = false;
            return;
          }
          this.info.records++;
          if (from === 1 || this.info.records >= from) {
            const { objname } = this.options;
            if (columns !== false) {
              const obj = {};
              for (let i = 0, l = record.length; i < l; i++) {
                if (columns[i] === void 0 || columns[i].disabled) continue;
                if (group_columns_by_name === true && obj[columns[i].name] !== void 0) {
                  if (Array.isArray(obj[columns[i].name])) {
                    obj[columns[i].name] = obj[columns[i].name].concat(record[i]);
                  } else {
                    obj[columns[i].name] = [obj[columns[i].name], record[i]];
                  }
                } else {
                  obj[columns[i].name] = record[i];
                }
              }
              if (raw === true || info2 === true) {
                const extRecord = Object.assign(
                  { record: obj },
                  raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
                  info2 === true ? { info: this.__infoRecord() } : {}
                );
                const err = this.__push(
                  objname === void 0 ? extRecord : [obj[objname], extRecord],
                  push
                );
                if (err) {
                  return err;
                }
              } else {
                const err = this.__push(
                  objname === void 0 ? obj : [obj[objname], obj],
                  push
                );
                if (err) {
                  return err;
                }
              }
            } else {
              if (raw === true || info2 === true) {
                const extRecord = Object.assign(
                  { record },
                  raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
                  info2 === true ? { info: this.__infoRecord() } : {}
                );
                const err = this.__push(
                  objname === void 0 ? extRecord : [record[objname], extRecord],
                  push
                );
                if (err) {
                  return err;
                }
              } else {
                const err = this.__push(
                  objname === void 0 ? record : [record[objname], record],
                  push
                );
                if (err) {
                  return err;
                }
              }
            }
          }
          this.__resetRecord();
        },
        __firstLineToColumns: function(record) {
          const { firstLineToHeaders } = this.state;
          try {
            const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
            if (!Array.isArray(headers)) {
              return this.__error(
                new CsvError(
                  "CSV_INVALID_COLUMN_MAPPING",
                  [
                    "Invalid Column Mapping:",
                    "expect an array from column function,",
                    `got ${JSON.stringify(headers)}`
                  ],
                  this.options,
                  this.__infoField(),
                  {
                    headers
                  }
                )
              );
            }
            const normalizedHeaders = normalize_columns_array(headers);
            this.state.expectedRecordLength = normalizedHeaders.length;
            this.options.columns = normalizedHeaders;
            this.__resetRecord();
            return;
          } catch (err) {
            return err;
          }
        },
        __resetRecord: function() {
          if (this.options.raw === true) {
            this.state.rawBuffer.reset();
          }
          this.state.error = void 0;
          this.state.record = [];
          this.state.record_length = 0;
        },
        __onField: function() {
          const { cast, encoding, rtrim, max_record_size } = this.options;
          const { enabled, wasQuoting } = this.state;
          if (enabled === false) {
            return this.__resetField();
          }
          let field = this.state.field.toString(encoding);
          if (rtrim === true && wasQuoting === false) {
            field = field.trimRight();
          }
          if (cast === true) {
            const [err, f] = this.__cast(field);
            if (err !== void 0) return err;
            field = f;
          }
          this.state.record.push(field);
          if (max_record_size !== 0 && typeof field === "string") {
            this.state.record_length += field.length;
          }
          this.__resetField();
        },
        __resetField: function() {
          this.state.field.reset();
          this.state.wasQuoting = false;
        },
        __push: function(record, push) {
          const { on_record } = this.options;
          if (on_record !== void 0) {
            const info2 = this.__infoRecord();
            try {
              record = on_record.call(null, record, info2);
            } catch (err) {
              return err;
            }
            if (record === void 0 || record === null) {
              return;
            }
          }
          this.info.bytes_records += this.info.bytes;
          push(record);
        },
        // Return a tuple with the error and the casted value
        __cast: function(field) {
          const { columns, relax_column_count } = this.options;
          const isColumns = Array.isArray(columns);
          if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
            return [void 0, void 0];
          }
          if (this.state.castField !== null) {
            try {
              const info2 = this.__infoField();
              return [void 0, this.state.castField.call(null, field, info2)];
            } catch (err) {
              return [err];
            }
          }
          if (this.__isFloat(field)) {
            return [void 0, parseFloat(field)];
          } else if (this.options.cast_date !== false) {
            const info2 = this.__infoField();
            return [void 0, this.options.cast_date.call(null, field, info2)];
          }
          return [void 0, field];
        },
        __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
          if (sourceBuf[0] !== firstByte) return 0;
          const sourceLength = sourceBuf.length;
          for (let i = 1; i < sourceLength; i++) {
            if (sourceBuf[i] !== targetBuf[targetPos + i]) return 0;
          }
          return sourceLength;
        },
        // Helper to test if a character is trimable
        __isCharTrimable: function(buf, pos) {
          const { timchars, timcharFirstBytes } = this.state;
          const first = buf[pos];
          if (first === void 0 || timcharFirstBytes[first] === 0) return 0;
          loop1: for (let i = 0; i < timchars.length; i++) {
            const timchar = timchars[i];
            for (let j = 0; j < timchar.length; j++) {
              if (timchar[j] !== buf[pos + j]) continue loop1;
            }
            return timchar.length;
          }
          return 0;
        },
        __isDelimiter: function(buf, pos, chr) {
          const { delimiter, ignore_last_delimiters } = this.options;
          if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
            return 0;
          } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
            return 0;
          }
          loop1: for (let i = 0; i < delimiter.length; i++) {
            const del = delimiter[i];
            if (del[0] === chr) {
              for (let j = 1; j < del.length; j++) {
                if (del[j] !== buf[pos + j]) continue loop1;
              }
              return del.length;
            }
          }
          return 0;
        },
        __isEscape: function(buf, pos, chr) {
          const { escape } = this.options;
          if (escape === null) return false;
          const l = escape.length;
          if (escape[0] === chr) {
            for (let i = 0; i < l; i++) {
              if (escape[i] !== buf[pos + i]) {
                return false;
              }
            }
            return true;
          }
          return false;
        },
        __isFloat: function(value) {
          return value - parseFloat(value) + 1 >= 0;
        },
        // Keep it in case we implement the `cast_int` option
        // __isInt(value){
        //   // return Number.isInteger(parseInt(value))
        //   // return !isNaN( parseInt( obj ) );
        //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
        // }
        __isQuote: function(buf, pos) {
          const { quote } = this.options;
          if (quote === null) return false;
          const l = quote.length;
          for (let i = 0; i < l; i++) {
            if (quote[i] !== buf[pos + i]) {
              return false;
            }
          }
          return true;
        },
        __isRecordDelimiter: function(chr, buf, pos) {
          const { record_delimiter } = this.options;
          const recordDelimiterLength = record_delimiter.length;
          loop1: for (let i = 0; i < recordDelimiterLength; i++) {
            const rd = record_delimiter[i];
            const rdLength = rd.length;
            if (rd[0] !== chr) {
              continue;
            }
            for (let j = 1; j < rdLength; j++) {
              if (rd[j] !== buf[pos + j]) {
                continue loop1;
              }
            }
            return rd.length;
          }
          return 0;
        },
        __autoDiscoverRecordDelimiter: function(buf, pos) {
          const { encoding } = this.options;
          const rds = [
            // Important, the windows line ending must be before mac os 9
            Buffer.from("\r\n", encoding),
            Buffer.from("\n", encoding),
            Buffer.from("\r", encoding)
          ];
          loop: for (let i = 0; i < rds.length; i++) {
            const l = rds[i].length;
            for (let j = 0; j < l; j++) {
              if (rds[i][j] !== buf[pos + j]) {
                continue loop;
              }
            }
            this.options.record_delimiter.push(rds[i]);
            this.state.recordDelimiterMaxLength = rds[i].length;
            return rds[i].length;
          }
          return 0;
        },
        __error: function(msg) {
          const { encoding, raw, skip_records_with_error } = this.options;
          const err = typeof msg === "string" ? new Error(msg) : msg;
          if (skip_records_with_error) {
            this.state.recordHasError = true;
            if (this.options.on_skip !== void 0) {
              try {
                this.options.on_skip(
                  err,
                  raw ? this.state.rawBuffer.toString(encoding) : void 0
                );
              } catch (err2) {
                return err2;
              }
            }
            return void 0;
          } else {
            return err;
          }
        },
        __infoDataSet: function() {
          return {
            ...this.info,
            columns: this.options.columns
          };
        },
        __infoRecord: function() {
          const { columns, raw, encoding } = this.options;
          return {
            ...this.__infoDataSet(),
            bytes_records: this.info.bytes,
            error: this.state.error,
            header: columns === true,
            index: this.state.record.length,
            raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
          };
        },
        __infoField: function() {
          const { columns } = this.options;
          const isColumns = Array.isArray(columns);
          const bytes_records = this.info.bytes_records;
          return {
            ...this.__infoRecord(),
            bytes_records,
            column: isColumns === true ? columns.length > this.state.record.length ? columns[this.state.record.length].name : null : this.state.record.length,
            quoting: this.state.wasQuoting
          };
        }
      };
    };
    var parse = function(data, opts = {}) {
      if (typeof data === "string") {
        data = Buffer.from(data);
      }
      const records = opts && opts.objname ? /* @__PURE__ */ Object.create(null) : [];
      const parser = transform(opts);
      const push = (record) => {
        if (parser.options.objname === void 0) records.push(record);
        else {
          records[record[0]] = record[1];
        }
      };
      const close = () => {
      };
      const error = parser.parse(data, true, push, close);
      if (error !== void 0) throw error;
      return records;
    };
    exports2.CsvError = CsvError;
    exports2.normalize_options = normalize_options;
    exports2.parse = parse;
  }
});

// src/budget-service.js
var require_budget_service = __commonJS({
  "src/budget-service.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var { parse } = require_sync();
    var logger2 = require_logger();
    var BudgetService = class {
      loadBudgets(filePath) {
        const fullPath = path.resolve(filePath);
        if (!fs.existsSync(fullPath)) {
          throw new Error(`Budget file not found: ${fullPath}`);
        }
        logger2.info(`Reading budget file: ${fullPath}`);
        const csv = fs.readFileSync(fullPath, "utf8");
        const records = parse(csv, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        const budgets = records.map((row) => ({
          username: row.username,
          budget: Number(row.budget),
          reason: row.reason || "",
          team: row.team || ""
        }));
        logger2.success(`${budgets.length} budget records loaded.`);
        return budgets;
      }
      printSummary(budgets) {
        logger2.startGroup("Budget Summary");
        budgets.forEach((user) => {
          logger2.info(
            `${user.username} | Budget=${user.budget} | Team=${user.team}`
          );
        });
        logger2.endGroup();
      }
    };
    module2.exports = new BudgetService();
  }
});

// src/validator.js
var require_validator = __commonJS({
  "src/validator.js"(exports2, module2) {
    var logger2 = require_logger();
    var Validator = class {
      validateBudgets(budgets) {
        const errors = [];
        const users = /* @__PURE__ */ new Set();
        budgets.forEach((item, index) => {
          if (!item.username) {
            errors.push(`Row ${index + 1}: username is required.`);
          }
          if (users.has(item.username)) {
            errors.push(`Duplicate username: ${item.username}`);
          }
          users.add(item.username);
          if (isNaN(item.budget)) {
            errors.push(`Invalid budget for ${item.username}`);
          }
          if (item.budget < 0) {
            errors.push(`Negative budget for ${item.username}`);
          }
        });
        if (errors.length) {
          logger2.error(errors.join("\n"));
          throw new Error("Budget validation failed.");
        }
        logger2.success("Budget validation passed.");
        return true;
      }
    };
    module2.exports = new Validator();
  }
});

// src/report-service.js
var require_report_service = __commonJS({
  "src/report-service.js"(exports2, module2) {
    var fs = require("fs");
    var logger2 = require_logger();
    var ReportService = class {
      generate(budgets, result = {}) {
        const summary = {
          total: budgets.length,
          created: result.created?.length || 0,
          updated: result.updated?.length || 0,
          skipped: result.skipped?.length || 0,
          failed: result.failed?.length || 0,
          generated: (/* @__PURE__ */ new Date()).toISOString()
        };
        const markdown = `# GitHub Copilot Budget Guardian Report

## Summary

| Metric | Count |
|--------|------:|
| Total Budgets | ${summary.total} |
| Created | ${summary.created} |
| Updated | ${summary.updated} |
| Skipped | ${summary.skipped} |
| Failed | ${summary.failed} |
| Generated | ${summary.generated} |

## Budget Details

| Username | Budget | Team | Reason |
|----------|-------:|------|--------|
${budgets.map(
          (u) => `| ${u.username} | ${u.budget} | ${u.team} | ${u.reason} |`
        ).join("\n")}
`;
        fs.writeFileSync("budget-report.md", markdown);
        fs.writeFileSync(
          "budget-report.json",
          JSON.stringify(
            {
              summary,
              budgets
            },
            null,
            2
          )
        );
        let csv = "username,budget,team,reason\n";
        budgets.forEach((u) => {
          csv += `${u.username},${u.budget},${u.team},${u.reason}
`;
        });
        fs.writeFileSync(
          "budget-report.csv",
          csv
        );
        logger2.success("budget-report.md generated.");
        logger2.success("budget-report.json generated.");
        logger2.success("budget-report.csv generated.");
      }
    };
    module2.exports = new ReportService();
  }
});

// src/sync-service.js
var require_sync_service = __commonJS({
  "src/sync-service.js"(exports2, module2) {
    var logger2 = require_logger();
    var validator = require_validator();
    var reportService = require_report_service();
    var SyncService2 = class {
      async sync(budgets, githubClient, config2) {
        logger2.startGroup("Budget Synchronization");
        validator.validateBudgets(budgets);
        const result = {
          total: budgets.length,
          created: [],
          updated: [],
          skipped: [],
          failed: []
        };
        let existingBudgets = [];
        if (githubClient && config2.enterpriseSlug) {
          try {
            existingBudgets = await githubClient.getExistingBudgets(
              config2.enterpriseSlug
            );
            logger2.success(
              `Fetched ${existingBudgets.length} existing budgets.`
            );
          } catch (err) {
            logger2.warning(
              "Unable to fetch existing budgets. Running in local mode."
            );
          }
        }
        for (const budget of budgets) {
          try {
            const existing = existingBudgets.find(
              (item) => (item.budget_entity_name || item.user || "").toLowerCase() === budget.username.toLowerCase()
            );
            if (!existing) {
              result.created.push(budget);
              logger2.info(
                `CREATE -> ${budget.username}`
              );
              if (githubClient && config2.enterpriseSlug && !config2.dryRun) {
                await githubClient.createBudget(
                  config2.enterpriseSlug,
                  {
                    budget_amount: budget.budget,
                    budget_scope: "user",
                    user: budget.username,
                    prevent_further_usage: true
                  }
                );
              }
              continue;
            }
            if (Number(existing.budget_amount) !== Number(budget.budget)) {
              result.updated.push({
                user: budget.username,
                from: existing.budget_amount,
                to: budget.budget
              });
              logger2.info(
                `UPDATE -> ${budget.username} (${existing.budget_amount} \u2192 ${budget.budget})`
              );
              if (githubClient && config2.enterpriseSlug && !config2.dryRun) {
                await githubClient.updateBudget(
                  config2.enterpriseSlug,
                  existing.id,
                  {
                    budget_amount: budget.budget,
                    user: budget.username,
                    prevent_further_usage: true
                  }
                );
              }
            } else {
              result.skipped.push(budget);
              logger2.info(
                `SKIP -> ${budget.username}`
              );
            }
          } catch (err) {
            result.failed.push({
              user: budget.username,
              error: err.message
            });
            logger2.error(
              `${budget.username}: ${err.message}`
            );
          }
        }
        reportService.generate(
          budgets,
          result
        );
        logger2.success(
          "Synchronization completed."
        );
        logger2.info(
          `Create : ${result.created.length}`
        );
        logger2.info(
          `Update : ${result.updated.length}`
        );
        logger2.info(
          `Skip   : ${result.skipped.length}`
        );
        logger2.info(
          `Failed : ${result.failed.length}`
        );
        logger2.setOutput(
          "created",
          result.created.length
        );
        logger2.setOutput(
          "updated",
          result.updated.length
        );
        logger2.setOutput(
          "skipped",
          result.skipped.length
        );
        logger2.setOutput(
          "failed",
          result.failed.length
        );
        logger2.endGroup();
        return result;
      }
    };
    module2.exports = new SyncService2();
  }
});

// src/github-client.js
var require_github_client = __commonJS({
  "src/github-client.js"(exports2, module2) {
    var github = require("@actions/github");
    var logger2 = require_logger();
    var GitHubClient2 = class {
      constructor(token) {
        this.octokit = github.getOctokit(token);
      }
      async getExistingBudgets(enterprise) {
        logger2.info("Fetching existing Copilot budgets...");
        const response = await this.octokit.request(
          "GET /enterprises/{enterprise}/settings/billing/budgets",
          {
            enterprise,
            per_page: 100
          }
        );
        (response.data.budgets || []).forEach((budget) => {
          logger2.info(
            `${budget.budget_scope} | ${budget.budget_entity_name} | ${budget.budget_amount}`
          );
        });
        return response.data.budgets || [];
      }
      async createBudget(enterprise, payload) {
        logger2.info(`Creating budget for ${payload.user}`);
        const response = await this.octokit.request(
          "POST /enterprises/{enterprise}/settings/billing/budgets",
          {
            enterprise,
            budget_amount: payload.budget_amount,
            budget_scope: "user",
            user: payload.user,
            prevent_further_usage: payload.prevent_further_usage ?? true,
            budget_product_sku: payload.budget_product_sku ?? "premium_requests",
            budget_type: payload.budget_type ?? "BundlePricing",
            budget_alerting: payload.budget_alerting ?? {
              will_alert: false,
              alert_recipients: []
            }
          }
        );
        logger2.success(
          `Budget created for ${payload.user}`
        );
        return response.data;
      }
      async updateBudget(enterprise, budgetId, payload) {
        logger2.info(
          `Updating budget ${budgetId}`
        );
        const response = await this.octokit.request(
          "PATCH /enterprises/{enterprise}/settings/billing/budgets/{budget_id}",
          {
            enterprise,
            budget_id: budgetId,
            budget_amount: payload.budget_amount,
            user: payload.user,
            prevent_further_usage: payload.prevent_further_usage ?? true,
            budget_alerting: payload.budget_alerting ?? {
              will_alert: false,
              alert_recipients: []
            }
          }
        );
        logger2.success(
          `Budget updated for ${payload.user}`
        );
        return response.data;
      }
    };
    module2.exports = GitHubClient2;
  }
});

// src/index.js
var logger = require_logger();
var config = require_config();
var budgetService = require_budget_service();
var SyncService = require_sync_service();
var GitHubClient = require_github_client();
async function run() {
  try {
    logger.startGroup("GitHub Copilot Budget Guardian");
    const cfg = config.load();
    const budgets = budgetService.loadBudgets(cfg.budgetFile);
    const client = new GitHubClient(cfg.githubToken);
    await SyncService.sync(budgets, client, cfg);
    logger.success("Budget file processed successfully.");
    logger.endGroup();
  } catch (err) {
    logger.fail(err);
  }
}
run();
