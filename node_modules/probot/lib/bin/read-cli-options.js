"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCliOptions = readCliOptions;
const commander_1 = require("commander");
const get_private_key_1 = require("@probot/get-private-key");
function readCliOptions(argv) {
    commander_1.program
        .usage("[options] <apps...>")
        .option("-p, --port <n>", "Port to start the server on", String(process.env.PORT || 3000))
        .option("-H --host <host>", "Host to start the server on", process.env.HOST)
        .option("-W, --webhook-proxy <url>", "URL of the webhook proxy service.`", process.env.WEBHOOK_PROXY_URL)
        .option("-w, --webhook-path <path>", "URL path which receives webhooks. Ex: `/webhook`", process.env.WEBHOOK_PATH)
        .option("-a, --app <id>", "ID of the GitHub App", process.env.APP_ID)
        .option("-s, --secret <secret>", "Webhook secret of the GitHub App", process.env.WEBHOOK_SECRET)
        .option("-P, --private-key <file>", "Path to private key file (.pem) for the GitHub App", process.env.PRIVATE_KEY_PATH)
        .option("-L, --log-level <level>", 'One of: "trace" | "debug" | "info" | "warn" | "error" | "fatal"', process.env.LOG_LEVEL || "info")
        .option("--log-format <format>", 'One of: "pretty", "json"', process.env.LOG_FORMAT)
        .option("--log-level-in-string", "Set to log levels (trace, debug, info, ...) as words instead of numbers (10, 20, 30, ...)", process.env.LOG_LEVEL_IN_STRING === "true")
        .option("--sentry-dsn <dsn>", 'Set to your Sentry DSN, e.g. "https://1234abcd@sentry.io/12345"', process.env.SENTRY_DSN)
        .option("--redis-url <url>", 'Set to a "redis://" url in order to enable cluster support for request throttling. Example: "redis://:secret@redis-123.redislabs.com:12345/0"', process.env.REDIS_URL)
        .option("--base-url <url>", 'GitHub API base URL. If you use GitHub Enterprise Server, and your hostname is "https://github.acme-inc.com", then the root URL is "https://github.acme-inc.com/api/v3"', process.env.GHE_HOST
        ? `${process.env.GHE_PROTOCOL || "https"}://${process.env.GHE_HOST}/api/v3`
        : "https://api.github.com")
        .parse(argv);
    const { app: appId, privateKey: privateKeyPath, redisUrl, ...options } = commander_1.program.opts();
    return {
        privateKey: (0, get_private_key_1.getPrivateKey)({ filepath: privateKeyPath }) || undefined,
        appId,
        redisConfig: redisUrl,
        args: commander_1.program.args,
        ...options,
    };
}
//# sourceMappingURL=read-cli-options.js.map