export interface WorldHandler {
    create: () => Promise<string>;
    join: (worldId: string) => Promise<void>;
    setWorldState: (state: any) => void;
}