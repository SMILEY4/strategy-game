import {AppConfig} from "../../main";

export function useLoadGameSessions() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameListAction);
    return () => action.perform()
}

export function useCreateGameSession() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameCreateAction);
    return (seed: string | null) => action.perform(seed)
}

export function useJoinGameSession() {
        const action = AppConfig.di.get(AppConfig.DIQ.GameJoinAction);
    return (gameId: string) => action.perform(gameId)

}

export function useConnectGameSession() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameConnectAction);
    return (gameId: string) => action.perform(gameId)
}

export function useDeleteGameSessions() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameDeleteAction);
    return (gameId: string) => action.perform(gameId)
}