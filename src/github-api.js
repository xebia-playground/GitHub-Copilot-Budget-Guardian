const { Octokit } = require("@octokit/core");
const logger = require("./logger");

class GitHubAPI {

    constructor(token) {

        this.client = new Octokit({
            auth: token,
            userAgent: "GitHub-Copilot-Budget-Guardian"
        });

    }

    async request(method, url, parameters = {}) {

        logger.info(`${method} ${url}`);

        const response = await this.client.request(
            `${method} ${url}`,
            parameters
        );

        return response.data;

    }

}

module.exports = GitHubAPI;