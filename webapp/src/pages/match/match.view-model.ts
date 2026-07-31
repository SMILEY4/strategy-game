import {useDataStatic} from "@modules/uicomponents/hooks/useData.ts";
import type {MatchDetails} from "@app/features/match/match.ts";
import {DI} from "@app/app.ts";
import {useParams} from "react-router";
import {useAction} from "@modules/uicomponents/hooks/useAction.ts";
import {useRouting} from "@pages/routing.tsx";

export function useMatchId(): string {
    return useParams().matchId!;
}

interface MatchViewModel {
    match: {
        data: MatchDetails,
        loading: boolean,
    };
    createGame: {
        execute: () => void;
        loading: boolean,
    };
    startGame: {
        execute: () => void;
    };
}

export function useMatchViewModel(matchId: string): MatchViewModel {

    const {gotoGame} = useRouting();

    const match = useDataStatic<MatchDetails>({
        fn: (subscription) => DI.matchDetailsUseCase.execute(matchId, subscription),
    });

    const [createGame, loadingCreateGame] = useAction(() => DI.createGameUseCase.execute(matchId));

    function handleStartGame() {
        if ((match.status === "available" || match.status === "updating") && match.data.gameId != null) {
            gotoGame(match.data.gameId);
        }
    }

    return {
        match: {
            data: match.status === "available" || match.status === "updating" ? match.data : null as unknown as MatchDetails,
            loading: match.status !== "available" && match.status !== "updating",
        },
        createGame: {
            execute: createGame,
            loading: loadingCreateGame,
        },
        startGame: {
            execute: () => handleStartGame(),
        },
    };

}