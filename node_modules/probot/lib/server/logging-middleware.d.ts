import { type Options, type HttpLogger } from "pino-http";
import type { Logger } from "pino";
export declare function getLoggingMiddleware(logger: Logger, options?: Options): HttpLogger;
