"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const pkg_conf_1 = __importDefault(require("pkg-conf"));
const index_js_1 = require("./index.js");
const setup_js_1 = require("./apps/setup.js");
const get_log_js_1 = require("./helpers/get-log.js");
const read_cli_options_js_1 = require("./bin/read-cli-options.js");
const read_env_options_js_1 = require("./bin/read-env-options.js");
const server_js_1 = require("./server/server.js");
const default_js_1 = require("./apps/default.js");
const resolve_app_function_js_1 = require("./helpers/resolve-app-function.js");
const is_production_js_1 = require("./helpers/is-production.js");
const dotenv_1 = require("dotenv");
/**
 *
 * @param appFnOrArgv set to either a probot application function: `(app) => { ... }` or to process.argv
 */
async function run(appFnOrArgv, additionalOptions) {
    (0, dotenv_1.config)();
    const envOptions = (0, read_env_options_js_1.readEnvOptions)(additionalOptions?.env);
    const cliOptions = Array.isArray(appFnOrArgv)
        ? (0, read_cli_options_js_1.readCliOptions)(appFnOrArgv)
        : {};
    const { 
    // log options
    logLevel: level, logFormat, logLevelInString, logMessageKey, sentryDsn, 
    // server options
    host, port, webhookPath, webhookProxy, 
    // probot options
    appId, privateKey, redisConfig, secret, baseUrl, 
    // others
    args, } = { ...envOptions, ...cliOptions };
    const log = (0, get_log_js_1.getLog)({
        level,
        logFormat,
        logLevelInString,
        logMessageKey,
        sentryDsn,
    });
    const probotOptions = {
        appId,
        privateKey,
        redisConfig,
        secret,
        baseUrl,
        log: additionalOptions?.log || log.child({ name: "probot" }),
        Octokit: additionalOptions?.Octokit || undefined,
    };
    const serverOptions = {
        host,
        port,
        webhookPath,
        webhookProxy,
        log: log.child({ name: "server" }),
        Probot: index_js_1.Probot.defaults(probotOptions),
    };
    let server;
    if (!appId || !privateKey) {
        if ((0, is_production_js_1.isProduction)()) {
            if (!appId) {
                throw new Error("App ID is missing, and is required to run in production mode. " +
                    "To resolve, ensure the APP_ID environment variable is set.");
            }
            else if (!privateKey) {
                throw new Error("Certificate is missing, and is required to run in production mode. " +
                    "To resolve, ensure either the PRIVATE_KEY or PRIVATE_KEY_PATH environment variable is set and contains a valid certificate");
            }
        }
        // Workaround for setup (#1512)
        // When probot is started for the first time, it gets into a setup mode
        // where `appId` and `privateKey` are not present. The setup mode gets
        // these credentials. In order to not throw an error, we set the values
        // to anything, as the Probot instance is not used in setup it makes no
        // difference anyway.
        server = new server_js_1.Server({
            ...serverOptions,
            Probot: index_js_1.Probot.defaults({
                ...probotOptions,
                appId: 1,
                privateKey: "dummy value for setup, see #1512",
            }),
        });
        await server.load((0, setup_js_1.setupAppFactory)(host, port));
        await server.start();
        return server;
    }
    if (Array.isArray(appFnOrArgv)) {
        const pkg = await (0, pkg_conf_1.default)("probot");
        const combinedApps = async (_app) => {
            await server.load(default_js_1.defaultApp);
            if (Array.isArray(pkg.apps)) {
                for (const appPath of pkg.apps) {
                    const appFn = await (0, resolve_app_function_js_1.resolveAppFunction)(appPath);
                    await server.load(appFn);
                }
            }
            const [appPath] = args;
            const appFn = await (0, resolve_app_function_js_1.resolveAppFunction)(appPath);
            await server.load(appFn);
        };
        server = new server_js_1.Server(serverOptions);
        await server.load(combinedApps);
        await server.start();
        return server;
    }
    server = new server_js_1.Server(serverOptions);
    await server.load(appFnOrArgv);
    await server.start();
    return server;
}
//# sourceMappingURL=run.js.map