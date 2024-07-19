import dotenv from "dotenv";
import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import fs from "fs";
import http from "http";

dotenv.config();

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const deploymentUrl = process.env.DEPLOYMENT_URL;

const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret
  },
});

// Define messages
const welcomeMessage = "Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.";
const deploymentMessage = (url) => `Deployment started for PR! Access it at ${url}`;
const closeMessage = "This PR has been closed without merging.";

// Handle pull request opened event
async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);

  try {
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: welcomeMessage,
      headers: {
        "x-github-api-version": "2022-11-28",
      },
    });
  } catch (error) {
    if (error.response) {
      console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
    }
    console.error(error);
  }
}

// Handle pull request closed (merged) event
async function handlePullRequestClosed({ octokit, payload }) {
  if (payload.pull_request.merged) {
    console.log(`Received a pull request merged event for #${payload.pull_request.number}`);

    try {
      await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: deploymentMessage(deploymentUrl),
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      });
    } catch (error) {
      if (error.response) {
        console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
      }
      console.error(error);
    }
  } else {
    console.log(`Received a pull request closed event for #${payload.pull_request.number}`);

    try {
      await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: closeMessage,
        headers: {
          "x-github-api-version": "2022-11-28",
        },
      });
    } catch (error) {
      if (error.response) {
        console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
      }
      console.error(error);
    }
  }
}

// Set up webhook event listeners for pull request events
app.webhooks.on("pull_request.opened", handlePullRequestOpened);
app.webhooks.on("pull_request.closed", handlePullRequestClosed);

// Log any errors that occur
app.webhooks.onError((error) => {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

// Define server details and webhook path
const port = 3000;
const host = 'localhost';
const path = "/api/webhook";
const localWebhookUrl = `http://${host}:${port}${path}`;

// Create middleware for handling webhook events
const middleware = createNodeMiddleware(app.webhooks, { path });

// Create and start the HTTP server
http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log('Press Ctrl + C to quit.');
});