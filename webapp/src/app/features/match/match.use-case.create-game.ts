import type {MatchRepository} from "@app/features/match/match-repository.ts";
import {seconds} from "@modules/utilities/time-units.ts";
import {delay} from "@modules/utilities/delay.ts";
import type {MatchClient} from "@app/features/match/match.client.ts";

export interface CreateGameUseCase {
    execute: (matchId: string) => Promise<void>;
}

interface Dependencies {
    client: MatchClient;
    repository: MatchRepository;
}

const MAX_POLLING_ATTEMPTS = 30;
const POLL_INTERVAL = seconds(2);

export const createGameUseCase = ({client, repository}: Dependencies): CreateGameUseCase => ({
    execute: async (matchId) => {

        await client.createGame(matchId);

        for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
            await delay(POLL_INTERVAL);

            await repository.prefetchDetails(matchId);

            const details = repository.getDetails(matchId);
            if (details?.gameId) {
                break;
            }

        }

    },
});