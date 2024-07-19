"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPackageJson = loadPackageJson;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function loadPackageJson(filepath = node_path_1.default.join(process.cwd(), "package.json")) {
    let pkgContent;
    try {
        pkgContent = node_fs_1.default.readFileSync(filepath, "utf8");
    }
    catch {
        return {};
    }
    try {
        const pkg = pkgContent && JSON.parse(pkgContent);
        if (pkg && typeof pkg === "object") {
            return pkg;
        }
        return {};
    }
    catch {
        return {};
    }
}
//# sourceMappingURL=load-package-json.js.map