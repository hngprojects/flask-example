"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedNodeVersion = isSupportedNodeVersion;
function isSupportedNodeVersion(nodeVersion = process.versions.node) {
    return Number(nodeVersion.split(".", 10)[0]) >= 18;
}
//# sourceMappingURL=is-supported-node-version.js.map