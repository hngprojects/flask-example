import type { ApplicationFunction } from "./types.js";
import { Logger, ProbotOctokit } from "./index.js";
import { Server } from "./server/server.js";
type AdditionalOptions = {
    env?: NodeJS.ProcessEnv;
    Octokit?: typeof ProbotOctokit;
    log?: Logger;
};
/**
 *
 * @param appFnOrArgv set to either a probot application function: `(app) => { ... }` or to process.argv
 */
export declare function run(appFnOrArgv: ApplicationFunction | string[], additionalOptions?: AdditionalOptions): Promise<Server>;
export {};
