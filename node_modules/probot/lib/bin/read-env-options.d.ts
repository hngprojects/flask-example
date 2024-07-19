import type { LogLevel } from "@probot/pino";
export declare function readEnvOptions(env?: NodeJS.ProcessEnv): {
    args: never[];
    privateKey: string | undefined;
    appId: number;
    port: number;
    host: string | undefined;
    secret: string | undefined;
    webhookPath: string | undefined;
    webhookProxy: string | undefined;
    logLevel: LogLevel;
    logFormat: "json" | "pretty";
    logLevelInString: boolean;
    logMessageKey: string | undefined;
    sentryDsn: string | undefined;
    redisConfig: string | undefined;
    baseUrl: string;
};
