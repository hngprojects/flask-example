"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultApp = defaultApp;
const node_path_1 = require("node:path");
const load_package_json_js_1 = require("../helpers/load-package-json.js");
const probot_js_1 = require("../views/probot.js");
function defaultApp(_app, { getRouter, cwd = process.cwd() }) {
    if (!getRouter) {
        throw new Error("getRouter() is required for defaultApp");
    }
    const pkg = (0, load_package_json_js_1.loadPackageJson)((0, node_path_1.resolve)(cwd, "package.json"));
    const probotViewRendered = (0, probot_js_1.probotView)({
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
    });
    const router = getRouter();
    router.get("/probot", (_req, res) => {
        res.send(probotViewRendered);
    });
    router.get("/", (_req, res) => res.redirect("/probot"));
}
//# sourceMappingURL=default.js.map