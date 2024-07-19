import updateDotenv from "update-dotenv";
import type { Env, OctokitOptions, PackageJson } from "./types.js";
export declare class ManifestCreation {
    get pkg(): PackageJson;
    createWebhookChannel(): Promise<string | undefined>;
    getManifest(pkg: PackageJson, baseUrl: string): string;
    createAppFromCode(code: string, probotOptions?: OctokitOptions): Promise<any>;
    updateEnv(env: Env): Promise<updateDotenv.Env>;
    get createAppUrl(): string;
}
