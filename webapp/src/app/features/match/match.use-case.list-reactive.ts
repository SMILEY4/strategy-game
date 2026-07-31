import type {MatchRepository} from "@app/features/match/match-repository.ts";
import type {ReactiveResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import type {MatchListEntry} from "@app/features/match/match.ts";

/** Use case for reactively observing the match list. */
export interface ListMatchesUseCase {
    execute: (subscription: ReactiveStateletSubscription<MatchListEntry[]>) => ReactiveResult<MatchListEntry[]>;
}

interface Dependencies {
    repository: MatchRepository;
}

export const listMatchesReactiveUseCase = ({repository}: Dependencies): ListMatchesUseCase => ({
    execute: (subscription: ReactiveStateletSubscription<MatchListEntry[]>) => repository.listAllReactive(subscription),
});