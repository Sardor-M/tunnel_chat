type ImportMeta = {
    readonly env: Record<string, any>;
    readonly hot: {
        readonly data: any;
        accept(): void;
        dispose(cb: (data: any) => void): void;
        invalidate(): void;
    };
    readonly glob: (pattern: string) => Record<string, () => Promise<any>>;
};
