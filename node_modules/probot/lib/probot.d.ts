import type { Logger } from "pino";
import type { EmitterWebhookEvent as WebhookEvent } from "@octokit/webhooks";
import { ProbotOctokit } from "./octokit/probot-octokit.js";
import type { ApplicationFunction, ApplicationFunctionOptions, Options, ProbotWebhooks } from "./types.js";
export type Constructor<T = any> = new (...args: any[]) => T;
export declare class Probot {
    static version: string;
    static defaults<S extends Constructor>(this: S, defaults: Options): {
        new (...args: any[]): {
            [x: string]: any;
        };
    } & S;
    webhooks: ProbotWebhooks;
    webhookPath: string;
    log: Logger;
    version: String;
    on: ProbotWebhooks["on"];
    onAny: ProbotWebhooks["onAny"];
    onError: ProbotWebhooks["onError"];
    auth: (installationId?: number, log?: Logger) => Promise<ProbotOctokit>;
    private state;
    constructor(options?: Options);
    receive(event: WebhookEvent): Promise<void>;
    load(appFn: ApplicationFunction | ApplicationFunction[], options?: ApplicationFunctionOptions): Promise<void>;
}
