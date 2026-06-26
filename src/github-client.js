const { Octokit } = require("@octokit/core");
const logger = require("./logger");

class GitHubClient {
  constructor(token) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: "GitHub-Copilot-Budget-Guardian/1.0.0"
    });
  }

  async request(method, url, body = {}) {
    try {
      logger.info(`${method} ${url}`);

      const response = await this.octokit.request(`${method} ${url}`, body);

      logger.success(`Status ${response.status}`);

      return response.data;

    } catch (error) {
      logger.fail(error.message);
      throw error;
    }
  }

  async validateEnterprise(enterpriseSlug) {
    return this.request(
      "GET",
      "/enterprises/{enterprise}",
      {
        enterprise: enterpriseSlug
      }
    );
  }

  async getCopilotSeats(enterpriseSlug) {
    return this.request(
      "GET",
      "/enterprises/{enterprise}/copilot/billing/seats",
      {
        enterprise: enterpriseSlug
      }
    );
  }
}

module.exports = GitHubClient;