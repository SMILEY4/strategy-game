export interface InteractionContextAdapter {
    get: () => any | null;
    set: (ctx: any) => void,
    update: (updater: (ctx: any) => any) => any;
    clear: () => void;
}