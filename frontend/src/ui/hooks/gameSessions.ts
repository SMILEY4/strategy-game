import {useNavigate} from "react-router-dom";
import {useHandleUnauthorized} from "./authentication";
import {AppCtx} from "../../logic/appContext";
import {UnauthorizedError} from "../../models/UnauthorizedError";

export function useLoadGameSessions() {
    const gameSessionService = AppCtx.di.get(AppCtx.DIQ.GameSessionService);
    const handleUnauthorized = useHandleUnauthorized();
    return () => {
        return gameSessionService.listSessions()
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
                return [];
            }));
    };
}

export function useCreateGameSession() {
    const gameSessionService = AppCtx.di.get(AppCtx.DIQ.GameSessionService);
    const handleUnauthorized = useHandleUnauthorized();
    return (seed: string | null) => {
        return gameSessionService.createSession(seed)
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };
}

export function useJoinGameSession() {
    const gameSessionService = AppCtx.di.get(AppCtx.DIQ.GameSessionService);
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: string) => {
        return gameSessionService.joinSession(gameId)
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };

}

export function useDeleteGameSession() {
    const gameSessionService = AppCtx.di.get(AppCtx.DIQ.GameSessionService);
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: string) => {
        return gameSessionService.deleteSession(gameId)
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };
}

export function useStartGameSession() {
    const navigate = useNavigate();
    return (gameId: string) => navigate("/game?id=" + gameId);
}


export function useConnectGameSession() {
    const gameSessionService = AppCtx.di.get(AppCtx.DIQ.GameSessionService);
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: string) => {
        gameSessionService.connectSession(gameId)
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };
}
