import dotenv from "dotenv";
import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";
import fs from "fs";
import http from "http";
import { exec } from "child_process";

dotenv.config();

const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

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

// Helper function to deploy container
async function deployContainer(owner, repo, prNumber) {
  return new Promise((resolve, reject) => {
    const containerName = `pr-${prNumber}-${repo}`;
    const buildCommand = `docker build -t ${containerName} .`;
    const runCommand = `docker run -d -p 5000:5000 --name ${containerName} ${containerName}`;

    exec(`${buildCommand} && ${runCommand}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        const url = `http://localhost:5000`; // Local deployment URL
        resolve(url);
      }
    });
  });
}

// Helper function to clean up container
async function cleanupContainer(owner, repo, prNumber) {
  return new Promise((resolve, reject) => {
    const containerName = `pr-${prNumber}-${repo}`;
    exec(`docker ps -aq -f name=${containerName}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else if (!stdout.trim()) {
        resolve(`No such container: ${containerName}`);
      } else {
        exec(`docker stop ${containerName} && docker rm ${containerName}`, (stopError, stopStdout, stopStderr) => {
          if (stopError) {
            reject(`Error: ${stopStderr}`);
          } else {
            resolve(`Cleaned up ${containerName}`);
          }
        });
      }
    });
  });
}

// Handle pull request opened event
async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);

  try {
    const url = await deployContainer(payload.repository.owner.login, payload.repository.name, payload.pull_request.number);
    await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: `${welcomeMessage}\n${deploymentMessage(url)}`,
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

// Handle pull request closed (merged or unmerged) event
async function handlePullRequestClosed({ octokit, payload }) {
  console.log(`Received a pull request closed event for #${payload.pull_request.number}`);

  try {
    await cleanupContainer(payload.repository.owner.login, payload.repository.name, payload.pull_request.number);
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
