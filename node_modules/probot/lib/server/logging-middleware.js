"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoggingMiddleware = getLoggingMiddleware;
const node_crypto_1 = require("node:crypto");
const pino_http_1 = require("pino-http");
function getLoggingMiddleware(logger, options) {
    return (0, pino_http_1.pinoHttp)({
        ...options,
        logger: logger.child({ name: "http" }),
        customSuccessMessage(_req, res) {
            const responseTime = Date.now() - res[pino_http_1.startTime];
            return `${res.req.method} ${res.req.url} ${res.statusCode} - ${responseTime}ms`;
        },
        customErrorMessage(_err, res) {
            const responseTime = Date.now() - res[pino_http_1.startTime];
            return `${res.req.method} ${res.req.url} ${res.statusCode} - ${responseTime}ms`;
        },
        genReqId: (req) => req.headers["x-request-id"] ||
            req.headers["x-github-delivery"] ||
            (0, node_crypto_1.randomUUID)(),
    });
}
//# sourceMappingURL=logging-middleware.js.map