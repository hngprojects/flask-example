import type { Logger } from "pino";
export declare const createWebhookProxy: (opts: WebhookProxyOptions) => Promise<EventSource | undefined>;
export interface WebhookProxyOptions {
    url: string;
    port?: number;
    path?: string;
    logger: Logger;
    fetch?: Function;
}
