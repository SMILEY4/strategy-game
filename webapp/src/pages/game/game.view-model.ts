import {useParams} from "react-router";
import {useEffect} from "react";
import {DI} from "@app/app.ts";
import {useDataStatic} from "@modules/uicomponents/hooks/useData.ts";

/** Extract the gameId from the URL route params. */
export function useGameId(): string {
    return useParams().gameId!;
}

interface GameViewModel {
    state: "loading" | "playing" | "error";
}


/** View-model for the game page, managing connection state via the game engine. */
export function useGameViewModel(gameId: string): GameViewModel {

    const state = useDataStatic<"loading" | "playing" | "error">({
        fn: (subscription) => DI.gameRepository.getStateReactive(subscription),
    });

    useEffect(() => {
        DI.gameEngine.start(gameId);
        return () => DI.gameEngine.stop();
    }, [gameId]);

    return {
        state: state.status === "available" || state.status === "updating" ? state.data : "loading",
    };
}