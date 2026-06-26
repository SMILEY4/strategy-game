import {DI} from "@app/app.ts";
import {useDataStatic} from "@modules/uicomponents/hooks/useData.ts";
import {useAction} from "@modules/uicomponents/hooks/useAction.ts";
import type {MatchListEntry} from "@app/features/match/match.ts";

interface MatchListViewModel {
    list: {
        matches: MatchListEntry[],
        loading: boolean,
    },
    create: {
        execute: () => void,
        loading: boolean,
    },
    delete: {
        execute: (matchId: string) => void,
        loading: boolean,
    }
}

export function useMatchListViewModel(): MatchListViewModel {

    const matches = useDataStatic<MatchListEntry[]>({
        fn: (subscription) => DI.listMatchesUseCase.execute(subscription),
    });

    const [createMatch, loadingCreateMatch] = useAction((name: string) => DI.createMatchUseCase.execute(name));

    const [deleteMatch, loadingDeleteMatch] = useAction((matchId: string) => DI.deleteMatchUseCase.execute(matchId));

    return {
        list: {
            matches: (matches.status === "available" || matches.status === "updating") ? matches.data : [],
            loading: matches.status !== "available" && matches.status !== "updating",
        },
        create: {
            execute: () => void createMatch(new Date().toString()),
            loading: loadingCreateMatch,
        },
        delete: {
            execute: deleteMatch,
            loading: loadingDeleteMatch,
        },
    };

}