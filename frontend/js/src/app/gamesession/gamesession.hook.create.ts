import {GameSessionClient} from "./gamesession.client";

export function useGameSessionCreate(): (name: string, seed: string | null) => Promise<void> {
    return (name: string, seed: string | null) => {
        return GameSessionClient
            .create(name, seed)
            .then(() => undefined);
    }
}