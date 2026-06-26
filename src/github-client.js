const github = require("@actions/github");
const logger = require("./logger");

class GitHubClient {
  constructor(token) {
    if (!token) {
      throw new Error("GitHub token is required.");
    }

    this.octokit = github.getOctokit(token);
  }

  async request(method, route, parameters = {}) {
    try {
      logger.info(`${method} ${route}`);

      const response = await this.octokit.request(
        `${method} ${route}`,
        parameters
      );

      logger.success(`${response.status} ${method} ${route}`);

      return response.data;
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  }

  async validateEnterprise(enterprise) {
    return this.request(
      "GET",
      "/enterprises/{enterprise}",
      {
        enterprise
      }
    );
  }

  async getCopilotSeats(enterprise) {
    return this.request(
      "GET",
      "/enterprises/{enterprise}/copilot/billing/seats",
      {
        enterprise
      }
    );
  }
}

module.exports = GitHubClient;