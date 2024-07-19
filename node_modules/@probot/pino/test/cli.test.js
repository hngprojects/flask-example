const path = require("path");
const spawn = require("child_process").spawn;
const { createServer } = require("http");

const test = require("tap").test;

const cliPath = require.resolve(path.join(__dirname, "..", "cli.js"));
const nodeBinaryPath = process.argv[0];

const logLine =
  '{"level":30,"time":1445858940000,"name":"probot","msg":"hello future","pid":42,"hostname":"foo"}\n';
const errorLine =
  '{"level":50,"time":1597399283686,"pid":35269,"hostname":"Gregors-MacBook-Pro.local","name":"probot","status":500,"event":{"event":"installation_repositories.added","id":"123","installation":456},"headers":{"x-github-request-id":"789"},"request":{"headers":{"accept":"application/vnd.github.v3+json","authorization":"[Filtered]","user-agent":"probot/10.0.0"},"method":"GET","url":"https://api.github.com/repos/octocat/hello-world/"},"stack":"Error: Oops\\n    at Object.<anonymous> (/Users/gregor/Projects/probot/pino/example.js:37:15)\\n    at Module._compile (internal/modules/cjs/loader.js:1137:30)\\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)\\n    at Module.load (internal/modules/cjs/loader.js:985:32)\\n    at Function.Module._load (internal/modules/cjs/loader.js:878:14)\\n    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)\\n    at internal/main/run_main_module.js:17:47","type":"Error","msg":"Oops"}\n';
const fatalErrorLine =
  '{"level":60,"time":1597426544906,"pid":43024,"hostname":"Gregors-MacBook-Pro.local","name":"probot","stack":"Error: Oh no!\\n    at Object.<anonymous> (/Users/gregor/Projects/probot/pino/example.js:59:12)\\n    at Module._compile (internal/modules/cjs/loader.js:1137:30)\\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1157:10)\\n    at Module.load (internal/modules/cjs/loader.js:985:32)\\n    at Function.Module._load (internal/modules/cjs/loader.js:878:14)\\n    at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:71:12)\\n    at internal/main/run_main_module.js:17:47","type":"Error","msg":"Oh no!"}\n';

const env = {
  // disable colors
  TERM: "dumb",
};

test("cli", (t) => {
  t.test(
    "formats using pino-pretty and Probot's preferences by default",
    (t) => {
      t.plan(1);
      const child = spawn(nodeBinaryPath, [cliPath], { env });
      child.on("error", t.threw);
      child.stdout.on("data", (data) => {
        t.equal(data.toString(), `INFO (probot): hello future\n`);
      });
      child.stdin.write(logLine);
      t.teardown(() => child.kill());
    }
  );

  t.test("errors include event, status, headers, and request keys", (t) => {
    t.plan(4);
    const child = spawn(nodeBinaryPath, [cliPath], { env });
    child.on("error", t.threw);
    child.stdout.on("data", (data) => {
      t.match(data.toString(), /event: "installation_repositories.added"/);
      t.match(data.toString(), /status: 500/);
      t.match(data.toString(), /x-github-request-id: "789"/);
      t.match(
        data.toString(),
        /url: "https:\/\/api.github.com\/repos\/octocat\/hello-world\/"/
      );
    });
    child.stdin.write(errorLine);
    t.teardown(() => child.kill());
  });

  t.test("LOG_FORMAT=json", (t) => {
    t.plan(1);
    const child = spawn(nodeBinaryPath, [cliPath], {
      env: { ...env, LOG_FORMAT: "json" },
    });
    child.on("error", t.threw);
    child.stdout.on("data", (data) => {
      t.equal(data.toString(), logLine);
    });
    child.stdin.write(logLine);
    t.teardown(() => child.kill());
  });

  t.test("LOG_LEVEL_IN_STRING=true", (t) => {
    t.plan(1);
    const child = spawn(nodeBinaryPath, [cliPath], {
      env: { ...env, LOG_FORMAT: "json", LOG_LEVEL_IN_STRING: "true" },
    });
    child.on("error", t.threw);
    child.stdout.on("data", (data) => {
      t.equal(data.toString(), logLine.replace('"level":30', '"level":"info"'));
    });
    child.stdin.write(logLine);
    t.teardown(() => child.kill());
  });

  t.test("SENTRY_DSN", (t) => {
    t.plan(5);

    const server = createServer((request, response) => {
      // we can access HTTP headers
      let body = "";
      request.on("data", (chunk) => {
        body += chunk.toString();
      });
      request.on("end", () => {
        const data = JSON.parse(body);
        const error = data.exception.values[0];

        t.equal(error.type, "Error");
        t.equal(error.value, "Oops");
        t.strictSame(data.extra, {
          event: {
            event: "installation_repositories.added",
            id: "123",
            installation: 456,
          },
          headers: { "x-github-request-id": "789" },
          request: {
            headers: {
              accept: "application/vnd.github.v3+json",
              authorization: "[Filtered]",
              "user-agent": "probot/10.0.0",
            },
            method: "GET",
            url: "https://api.github.com/repos/octocat/hello-world/",
          },
          status: 500,
        });
        server.close(t.end);
      });

      response.writeHead(200);
      response.write("ok");
      response.end();
    });

    server.listen(0);

    const child = spawn(nodeBinaryPath, [cliPath], {
      env: {
        ...env,
        SENTRY_DSN: `http://user@localhost:${server.address().port}/123`,
      },
    });
    child.on("error", t.threw);
    child.stdout.on("data", (data) => {
      const errorStringLines = data.toString().split(/\n/);
      t.equal(errorStringLines[0].trim(), "ERROR (probot): Oops");

      // skip the error stack, normalize Sentry Event ID, compare error details only
      t.equal(
        errorStringLines
          .slice(9)
          .join("\n")
          .trim()
          .replace(/sentryEventId: \w+$/, "sentryEventId: 123"),
        `event: {
    id: "123"
}
status: 500
headers: {
    x-github-request-id: "789"
}
request: {
    method: "GET"
    url: "https://api.github.com/repos/octocat/hello-world/"
}
sentryEventId: 123`
      );
    });
    child.stdin.write(errorLine);

    t.teardown(() => child.kill());
  });

  t.test("SENTRY_DSN with fatal error", (t) => {
    t.plan(3);

    const server = createServer((request, response) => {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk.toString();
      });
      request.on("end", () => {
        const data = JSON.parse(body);
        const error = data.exception.values[0];

        t.equal(error.type, "Error");
        t.equal(error.value, "Oh no!");

        server.close(t.end);
      });

      response.writeHead(200);
      response.write("ok");
      response.end();
    });

    server.listen(0);

    const child = spawn(nodeBinaryPath, [cliPath], {
      env: {
        ...env,
        SENTRY_DSN: `http://user@localhost:${server.address().port}/123`,
      },
    });
    child.on("error", t.threw);
    child.stdout.on("data", (data) => {
      t.match(data.toString(), /^FATAL \(probot\): Oh no!\n/);
    });
    child.stdin.write(fatalErrorLine);

    t.teardown(() => child.kill());
  });

  t.end();
});
