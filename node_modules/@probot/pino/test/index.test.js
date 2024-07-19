const Sentry = require("@sentry/node");

const Stream = require("stream");

const test = require("tap").test;
const pino = require("pino");
const { getTransformStream } = require("..");

test("API", (t) => {
  let env = Object.assign({}, process.env);

  t.afterEach(() => {
    process.env = Object.assign({}, env);
  });

  t.test("getTransformStream export", (t) => {
    t.type(getTransformStream, Function);
    t.end();
  });

  t.test("getTransformStream without options", (t) => {
    getTransformStream();
    t.end();
  });

  t.test("Sentry integation enabled", (t) => {
    const transform = getTransformStream({
      sentryDsn: "http://username@example.com/1234",
    });
    const log = pino({}, transform);

    function event(payload) {
      const error = new Error("Hello from the test");
      error.level = 50;
      error.event = {
        payload: Object.assign(
          {
            installation: {
              id: "456",
            },
          },
          payload
        ),
      };
      return error;
    }

    t.test("without user", (t) => {
      t.plan(1);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.strictSame(event.user, { id: "456", username: undefined });
        });

        log.fatal(event({}));
      });
    });

    t.test("with organization", (t) => {
      t.plan(1);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.match(event.user, { username: "org" });
        });

        log.fatal(event({ organization: { login: "org" } }));
      });
    });

    t.test("with installation account", (t) => {
      t.plan(1);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.match(event.user, { username: "account" });
        });

        log.fatal(event({ installation: { account: { login: "account" } } }));
      });
    });

    t.test("with repository owner", (t) => {
      t.plan(1);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.match(event.user, { username: "owner" });
        });

        log.fatal(event({ repository: { owner: { login: "owner" } } }));
      });
    });

    t.test("with repository owner and without installation", (t) => {
      t.plan(1);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.match(event.user, { username: "owner" });
        });

        log.fatal(
          event({
            installation: undefined,
            repository: { owner: { login: "owner" } },
          })
        );
      });
    });

    t.test("with logFormat: json", (t) => {
      t.plan(1);

      const transform = getTransformStream({
        sentryDsn: "http://username@example.com/1234",
        logFormat: "json",
      });
      const log = pino({}, transform);

      Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event, hint) {
          t.match(event.user, { username: "owner" });
        });

        log.fatal(event({ repository: { owner: { login: "owner" } } }));
      });
    });

    t.end();
  });

  t.test(
    "A single \\n is added to the end log lines when LOG_FORMAT is set to 'json' (https://github.com/probot/probot/issues/1334)",
    (t) => {
      const streamLogsToOutput = new Stream.Writable({ objectMode: true });
      const output = [];
      streamLogsToOutput._write = (line, encoding, done) => {
        output.push(line);
        done();
      };

      const transform = getTransformStream({
        logFormat: "json",
        logLevelInString: true,
      });
      transform.pipe(streamLogsToOutput);
      const log = pino({}, transform);

      log.info("test");

      t.equal(
        output.join(""),
        output.join("").trim() + "\n",
        'No "\\n" is added to end of line'
      );

      t.equal(JSON.parse(output).level, "info");

      t.end();
    }
  );

  t.end();
});
