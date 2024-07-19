import type { Logger } from "pino";
import type { EmitterWebhookEvent as WebhookEvent } from "@octokit/webhooks";
export declare function getErrorHandler(log: Logger): (error: Error & {
    event?: WebhookEvent;
}) => void;
