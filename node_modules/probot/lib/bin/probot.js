"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const commander_1 = require("commander");
const dotenv_1 = require("dotenv");
const is_supported_node_version_js_1 = require("../helpers/is-supported-node-version.js");
const load_package_json_js_1 = require("../helpers/load-package-json.js");
/*import { dirname } from 'path';
import { fileURLToPath } from 'url';*/
(0, dotenv_1.config)();
//const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = (0, load_package_json_js_1.loadPackageJson)((0, node_path_1.resolve)(__dirname, "package.json"));
if (!(0, is_supported_node_version_js_1.isSupportedNodeVersion)()) {
    console.log(`Node.js version 18 is required. You have ${process.version}.`);
    process.exit(1);
}
commander_1.program
    .version(pkg.version || "0.0.0-dev")
    .usage("<command> [options]")
    .command("run", "run the bot")
    .command("receive", "Receive a single event and payload")
    .on("command:*", (cmd) => {
    if (!commander_1.program.commands.find((c) => c.name() == cmd[0])) {
        console.error(`Invalid command: ${commander_1.program.args.join(" ")}\n`);
        commander_1.program.outputHelp();
        process.exit(1);
    }
});
commander_1.program.parse(process.argv);
//# sourceMappingURL=probot.js.map