"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProbot = createProbot;
const get_private_key_1 = require("@probot/get-private-key");
const get_log_js_1 = require("./helpers/get-log.js");
const probot_js_1 = require("./probot.js");
const server_js_1 = require("./server/server.js");
const DEFAULTS = {
    APP_ID: "",
    WEBHOOK_SECRET: "",
    WEBHOOK_PATH: server_js_1.defaultWebhooksPath,
    GHE_HOST: "",
    GHE_PROTOCOL: "https",
    LOG_FORMAT: undefined,
    LOG_LEVEL: "warn",
    LOG_LEVEL_IN_STRING: "false",
    LOG_MESSAGE_KEY: "msg",
    REDIS_URL: "",
    SENTRY_DSN: "",
};
/**
 * Merges configuration from defaults/environment variables/overrides and returns
 * a Probot instance. Finds private key using [`@probot/get-private-key`](https://github.com/probot/get-private-key).
 *
 * @see https://probot.github.io/docs/configuration/
 * @param defaults default Options, will be overwritten if according environment variable is set
 * @param overrides overwrites defaults and according environment variables
 * @param env defaults to process.env
 */
function createProbot({ overrides = {}, defaults = {}, env = process.env, } = {}) {
    const privateKey = (0, get_private_key_1.getPrivateKey)({ env });
    const envWithDefaults = { ...DEFAULTS, ...env };
    const envOptions = {
        logLevel: envWithDefaults.LOG_LEVEL,
        appId: Number(envWithDefaults.APP_ID),
        privateKey: (privateKey && privateKey.toString()) || undefined,
        secret: envWithDefaults.WEBHOOK_SECRET,
        redisConfig: envWithDefaults.REDIS_URL,
        webhookPath: envWithDefaults.WEBHOOK_PATH,
        baseUrl: envWithDefaults.GHE_HOST
            ? `${envWithDefaults.GHE_PROTOCOL || "https"}://${envWithDefaults.GHE_HOST}/api/v3`
            : "https://api.github.com",
    };
    const probotOptions = {
        ...defaults,
        ...envOptions,
        ...overrides,
    };
    const log = (0, get_log_js_1.getLog)({
        level: probotOptions.logLevel,
        logFormat: envWithDefaults.LOG_FORMAT,
        logLevelInString: envWithDefaults.LOG_LEVEL_IN_STRING === "true",
        logMessageKey: envWithDefaults.LOG_MESSAGE_KEY,
        sentryDsn: envWithDefaults.SENTRY_DSN,
    }).child({ name: "server" });
    return new probot_js_1.Probot({
        log: log.child({ name: "probot" }),
        ...probotOptions,
    });
}
//# sourceMappingURL=create-probot.js.map