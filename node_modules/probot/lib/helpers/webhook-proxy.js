"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhookProxy = void 0;
const createWebhookProxy = async (opts) => {
    try {
        const SmeeClient = (await import("smee-client")).default;
        const smee = new SmeeClient({
            logger: opts.logger,
            source: opts.url,
            target: `http://localhost:${opts.port}${opts.path}`,
            fetch: opts.fetch,
        });
        return smee.start();
    }
    catch (error) {
        opts.logger.warn("Run `npm install --save-dev smee-client` to proxy webhooks to localhost.");
        return;
    }
};
exports.createWebhookProxy = createWebhookProxy;
//# sourceMappingURL=webhook-proxy.js.map