import type {MatchRepository} from "@app/features/match/match-repository.ts";
import type {ReactiveResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import type {MatchDetails} from "@app/features/match/match.ts";

/** Use case for reactively observing match details. */
export interface MatchDetailsReactiveUseCase {
    execute: (matchId: string, subscription: ReactiveStateletSubscription<MatchDetails>) => ReactiveResult<MatchDetails>;
}

interface Dependencies {
    repository: MatchRepository;
}

export const matchDetailsReactiveUseCase = ({repository}: Dependencies): MatchDetailsReactiveUseCase => ({
    execute: (matchId: string, subscription: ReactiveStateletSubscription<MatchDetails>) => repository.detailsReactive(matchId, subscription),
});