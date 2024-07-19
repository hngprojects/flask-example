"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookTransform = webhookTransform;
const context_js_1 = require("../context.js");
/**
 * Probot's transform option, which extends the `event` object that is passed
 * to webhook event handlers by `@octokit/webhooks`
 * @see https://github.com/octokit/webhooks.js/#constructor
 */
async function webhookTransform(state, event) {
    const log = state.log.child({ name: "event", id: event.id });
    const octokit = (await state.octokit.auth({
        type: "event-octokit",
        event,
    }));
    return new context_js_1.Context(event, octokit, log);
}
//# sourceMappingURL=octokit-webhooks-transform.js.map