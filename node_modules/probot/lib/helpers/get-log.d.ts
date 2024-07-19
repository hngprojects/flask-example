import type { Logger } from "pino";
import { type Options, type LogLevel } from "@probot/pino";
export type GetLogOptions = {
    level?: LogLevel;
    logMessageKey?: string;
} & Options;
export declare function getLog(options?: GetLogOptions): Logger;
