type Options = {
    filepath?: string;
    env?: {
        PRIVATE_KEY?: string;
        PRIVATE_KEY_PATH?: string;
        [key: string]: string | undefined;
    };
    cwd?: string;
};
export declare function getPrivateKey(options?: Options): string | null;
export declare namespace getPrivateKey {
    var VERSION: string;
}
export {};
