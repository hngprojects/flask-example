"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnvOptions = readEnvOptions;
const get_private_key_1 = require("@probot/get-private-key");
function readEnvOptions(env = process.env) {
    const privateKey = (0, get_private_key_1.getPrivateKey)({ env });
    const logFormat = env.LOG_FORMAT && env.LOG_FORMAT.length !== 0
        ? env.LOG_FORMAT === "pretty"
            ? "pretty"
            : "json"
        : env.NODE_ENV === "production"
            ? "json"
            : "pretty";
    return {
        args: [],
        privateKey: (privateKey && privateKey.toString()) || undefined,
        appId: Number(env.APP_ID),
        port: Number(env.PORT) || 3000,
        host: env.HOST,
        secret: env.WEBHOOK_SECRET,
        webhookPath: env.WEBHOOK_PATH,
        webhookProxy: env.WEBHOOK_PROXY_URL,
        logLevel: env.LOG_LEVEL,
        logFormat: logFormat,
        logLevelInString: env.LOG_LEVEL_IN_STRING === "true",
        logMessageKey: env.LOG_MESSAGE_KEY,
        sentryDsn: env.SENTRY_DSN,
        redisConfig: env.REDIS_URL,
        baseUrl: env.GHE_HOST
            ? `${env.GHE_PROTOCOL || "https"}://${env.GHE_HOST}/api/v3`
            : "https://api.github.com",
    };
}
//# sourceMappingURL=read-env-options.js.map