import { Probot } from "../probot.js";
import type { ApplicationFunctionOptions } from "../types.js";
export declare const setupAppFactory: (host: string | undefined, port: number | undefined) => (app: Probot, { getRouter }: ApplicationFunctionOptions) => Promise<void>;
