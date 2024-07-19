const { Probot, createNodeMiddleware } = require('probot');
const dotenv = require('dotenv');
const appFn = require('./bot');

// Load environment variables from .env file
dotenv.config();

const probot = new Probot({
  appId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure private key is formatted correctly
  secret: process.env.WEBHOOK_SECRET,
});

probot.load(appFn);

// Export the Probot server as middleware
module.exports = createNodeMiddleware(probot, { webhooksPath: '/api/webhooks' });
