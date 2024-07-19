const pump = require("pump");
const split = require("split2");

const { getTransformStream } = require("./");

const options = {
  logFormat: process.env.LOG_FORMAT,
  logLevelInString: process.env.LOG_LEVEL_IN_STRING,
  sentryDsn: process.env.SENTRY_DSN,
};

pump(process.stdin, split(), getTransformStream(options), process.stdout);
