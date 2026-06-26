import type {MatchRepository} from "@app/features/match/match-repository.ts";

export interface DeleteMatchUseCase {
    execute: (matchId: string) => Promise<void>;
}

interface Dependencies {
    repository: MatchRepository;
}

export const deleteMatchUseCase = ({repository}: Dependencies): DeleteMatchUseCase => ({
    execute: (matchId) => repository.delete(matchId),
});