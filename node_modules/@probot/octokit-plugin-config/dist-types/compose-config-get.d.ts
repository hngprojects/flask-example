import { Octokit } from "@octokit/core";
import type { Configuration, GetOptions, GetResult } from "./types";
/**
 * Loads configuration from one or multiple files and resolves with
 * the combined configuration as well as the list of files the configuration
 * was loaded from
 *
 * @param octokit Octokit instance
 * @param options
 */
export declare function composeConfigGet<T extends Configuration = Configuration>(octokit: Octokit, { owner, repo, defaults, path, branch }: GetOptions<T>): Promise<GetResult<T>>;
