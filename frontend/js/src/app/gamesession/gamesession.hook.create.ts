import {GameSessionClient} from "./gamesession.client";

export function useGameSessionCreate(): (name: string, seed: string | null) => Promise<void> {

    function create(name: string, seed: string | null): Promise<void> {
        return GameSessionClient
            .create(name, seed)
            .then(() => undefined);
    }

    return create;
}