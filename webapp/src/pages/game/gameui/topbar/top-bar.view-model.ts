import {DI} from "@app/app.ts";

export interface TopBarViewModel {
    submitTurn: {
        available: boolean,
        execute: () => void
    };
}

export function useTopBarViewModel(): TopBarViewModel {
    return {
        submitTurn: {
            available: true,
            execute: () => DI.gameActionEndTurn.execute(),
        },
    };
}