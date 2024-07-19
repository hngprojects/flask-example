"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProbotOctokitWithDefaults = getProbotOctokitWithDefaults;
const request_1 = require("@octokit/request");
const get_octokit_throttle_options_js_1 = require("./get-octokit-throttle-options.js");
/**
 * Returns an Octokit instance with default settings for authentication. If
 * a `githubToken` is passed explicitly, the Octokit instance will be
 * pre-authenticated with that token when instantiated. Otherwise Octokit's
 * app authentication strategy is used, and `options.auth` options are merged
 * deeply when instantiated.
 *
 * Besides the authentication, the Octokit's baseUrl is set as well when run
 * against a GitHub Enterprise Server with a custom domain.
 */
function getProbotOctokitWithDefaults(options) {
    const authOptions = options.githubToken
        ? {
            token: options.githubToken,
            request: request_1.request.defaults({
                request: {
                    fetch: options.request?.fetch,
                },
            }),
        }
        : {
            cache: options.cache,
            appId: options.appId,
            privateKey: options.privateKey,
            request: request_1.request.defaults({
                request: {
                    fetch: options.request?.fetch,
                },
            }),
        };
    const octokitThrottleOptions = (0, get_octokit_throttle_options_js_1.getOctokitThrottleOptions)({
        log: options.log,
        redisConfig: options.redisConfig,
    });
    let defaultOptions = {
        auth: authOptions,
        log: options.log.child
            ? options.log.child({ name: "octokit" })
            : options.log,
    };
    if (options.baseUrl) {
        defaultOptions.baseUrl = options.baseUrl;
    }
    if (octokitThrottleOptions) {
        defaultOptions.throttle = octokitThrottleOptions;
    }
    return options.Octokit.defaults((instanceOptions) => {
        const options = Object.assign({}, defaultOptions, instanceOptions, {
            auth: instanceOptions.auth
                ? Object.assign({}, defaultOptions.auth, instanceOptions.auth)
                : defaultOptions.auth,
        });
        if (instanceOptions.throttle) {
            options.throttle = Object.assign({}, defaultOptions.throttle, instanceOptions.throttle);
        }
        return options;
    });
}
//# sourceMappingURL=get-probot-octokit-with-defaults.js.map