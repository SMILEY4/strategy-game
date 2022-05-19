export interface WorldHandler {
    create: () => Promise<string>;
    join: (worldId: string) => Promise<void>;
    setInitialState: (state: any) => void;
}