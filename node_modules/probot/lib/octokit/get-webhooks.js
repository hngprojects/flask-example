"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebhooks = getWebhooks;
const webhooks_1 = require("@octokit/webhooks");
const get_error_handler_js_1 = require("../helpers/get-error-handler.js");
const octokit_webhooks_transform_js_1 = require("./octokit-webhooks-transform.js");
function getWebhooks(state) {
    const webhooks = new webhooks_1.Webhooks({
        log: state.log,
        secret: state.webhooks.secret,
        transform: (hook) => (0, octokit_webhooks_transform_js_1.webhookTransform)(state, hook),
    });
    webhooks.onError((0, get_error_handler_js_1.getErrorHandler)(state.log));
    return webhooks;
}
//# sourceMappingURL=get-webhooks.js.map