"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorHandler = getErrorHandler;
function getErrorHandler(log) {
    return (error) => {
        const errors = (error.name === "AggregateError" ? error : [error]);
        const event = error.event;
        for (const error of errors) {
            const errMessage = (error.message || "").toLowerCase();
            if (errMessage.includes("x-hub-signature-256")) {
                log.error(error, "Go to https://github.com/settings/apps/YOUR_APP and verify that the Webhook secret matches the value of the WEBHOOK_SECRET environment variable.");
                continue;
            }
            if (errMessage.includes("pem") || errMessage.includes("json web token")) {
                log.error(error, "Your private key (a .pem file or PRIVATE_KEY environment variable) or APP_ID is incorrect. Go to https://github.com/settings/apps/YOUR_APP, verify that APP_ID is set correctly, and generate a new PEM file if necessary.");
                continue;
            }
            log
                .child({
                name: "event",
                id: event?.id,
            })
                .error(error);
        }
    };
}
//# sourceMappingURL=get-error-handler.js.map