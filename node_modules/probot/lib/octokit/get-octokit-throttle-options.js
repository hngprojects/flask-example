"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokitThrottleOptions = getOctokitThrottleOptions;
const bottleneck_1 = __importDefault(require("bottleneck"));
const ioredis_1 = require("ioredis");
function getOctokitThrottleOptions(options) {
    let { log, redisConfig } = options;
    const throttlingOptions = {
        onRateLimit: (retryAfter, options) => {
            log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
            // Retry twice after hitting a rate limit error, then give up
            if (options.request.retryCount <= 2) {
                log.info(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
            return false;
        },
        onSecondaryRateLimit: (_retryAfter, options) => {
            // does not retry, only logs a warning
            log.warn(`Secondary quota detected for request ${options.method} ${options.url}`);
        },
    };
    if (!redisConfig)
        return throttlingOptions;
    const connection = new bottleneck_1.default.IORedisConnection({
        client: getRedisClient(options),
    });
    connection.on("error", (error) => {
        log.error(Object.assign(error, { source: "bottleneck" }));
    });
    throttlingOptions.Bottleneck = bottleneck_1.default;
    throttlingOptions.connection = connection;
    return throttlingOptions;
}
function getRedisClient({ redisConfig }) {
    if (redisConfig)
        return new ioredis_1.Redis(redisConfig);
}
//# sourceMappingURL=get-octokit-throttle-options.js.map