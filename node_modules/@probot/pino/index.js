module.exports = { getTransformStream };

const { Transform } = require("readable-stream");

const prettyFactory = require("pino-pretty");
const Sentry = require("@sentry/node");

const LEVEL_MAP = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

/**
 * Implements Probot's default logging formatting and error captionaing using Sentry.
 *
 * @param {import("./").Options} options
 * @returns Transform
 * @see https://getpino.io/#/docs/transports
 */
function getTransformStream(options = {}) {
  const formattingEnabled = options.logFormat !== "json";

  const levelAsString = options.logLevelInString;
  const sentryEnabled = !!options.sentryDsn;

  if (sentryEnabled) {
    Sentry.init({
      dsn: options.sentryDsn,
      // See https://github.com/getsentry/sentry-javascript/issues/1964#issuecomment-688482615
      // 6 is enough to serialize the deepest property across all GitHub Event payloads
      normalizeDepth: 6,
    });
  }

  const pretty = prettyFactory({
    ignore: [
      // default pino keys
      "time",
      "pid",
      "hostname",
      // remove keys from pino-http
      "req",
      "res",
      "responseTime",
    ].join(","),
    errorProps: ["event", "status", "headers", "request", "sentryEventId"].join(
      ","
    ),
  });

  return new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      const line = chunk.toString().trim();

      /* istanbul ignore if */
      if (line === undefined) return cb();

      const data = sentryEnabled ? JSON.parse(line) : null;

      if (!sentryEnabled || data.level < 50) {
        if (formattingEnabled) {
          return cb(null, pretty(line));
        }

        if (levelAsString) {
          return cb(null, stringifyLogLevel(JSON.parse(line)));
        }

        cb(null, line + "\n");
        return;
      }

      Sentry.withScope(function (scope) {
        const sentryLevelName =
          data.level === 50 ? Sentry.Severity.Error : Sentry.Severity.Fatal;
        scope.setLevel(sentryLevelName);

        for (const extra of ["event", "headers", "request", "status"]) {
          if (!data[extra]) continue;

          scope.setExtra(extra, data[extra]);
        }

        // set user id and username to installation ID and account login
        if (data.event && data.event.payload) {
          const {
            // When GitHub App is installed organization wide
            installation: { id, account: { login: account } = {} } = {},

            // When the repository belongs to an organization
            organization: { login: organization } = {},
            // When the repository belongs to a user
            repository: { owner: { login: owner } = {} } = {},
          } = data.event.payload;

          scope.setUser({
            id: id,
            username: account || organization || owner,
          });
        }

        const sentryEventId = Sentry.captureException(toSentryError(data));

        // reduce logging data and add reference to sentry event instead
        if (data.event) {
          data.event = { id: data.event.id };
        }
        if (data.request) {
          data.request = {
            method: data.request.method,
            url: data.request.url,
          };
        }
        data.sentryEventId = sentryEventId;

        if (formattingEnabled) {
          return cb(null, pretty(data));
        }

        // istanbul ignore if
        if (levelAsString) {
          return cb(null, stringifyLogLevel(data));
        }

        cb(null, JSON.stringify(data) + "\n");
      });
    },
  });
}

function stringifyLogLevel(data) {
  data.level = LEVEL_MAP[data.level];
  return JSON.stringify(data) + "\n";
}

function toSentryError(data) {
  const error = new Error(data.msg);
  error.name = data.type;
  error.stack = data.stack;
  return error;
}
