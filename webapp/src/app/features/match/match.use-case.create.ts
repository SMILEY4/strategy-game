import type {MatchRepository} from "@app/features/match/match-repository.ts";

/** Use case for creating a new match. */
export interface CreateMatchUseCase {
    execute: (name: string) => Promise<void>;
}

interface Dependencies {
    repository: MatchRepository;
}

export const createMatchUseCase = ({repository}: Dependencies): CreateMatchUseCase => ({
    execute: (name) => repository.create(name),
});