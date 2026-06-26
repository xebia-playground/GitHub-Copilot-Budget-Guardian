const GitHubClient = require("../../src/github-client");

async function run() {

    const client = new GitHubClient("dummy-token");

    console.log("GitHub Client Created Successfully");

}

run();