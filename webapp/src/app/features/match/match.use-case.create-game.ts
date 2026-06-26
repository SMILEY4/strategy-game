import type {MatchRepository} from "@app/features/match/match-repository.ts";

export interface CreateGameUseCase {
    execute: (matchId: string) => Promise<void>;
}

interface Dependencies {
    repository: MatchRepository;
}

export const createGameUseCase = ({repository}: Dependencies): CreateGameUseCase => ({
    execute: (matchId) => repository.createGame(matchId),
});