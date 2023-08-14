import {AppConfig} from "../../main";
import {UnauthorizedError} from "../../core/models/errors/UnauthorizedError";
import {useHandleUnauthorized} from "./user";
import {useNavigate} from "react-router-dom";

export function useLoadGameSessions() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameListAction);
    const handleUnauthorized = useHandleUnauthorized();
    return () => {
        return action.perform()
            .catch(e => {
                if (e instanceof UnauthorizedError) {
                    handleUnauthorized();
                    return [];
                } else {
                    throw e;
                }
            });
    };
}

export function useCreateGameSession() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameCreateAction);
    const handleUnauthorized = useHandleUnauthorized();
    return (seed: string | null) => {
        return action.perform(seed)
            .catch(e => {
                if (e instanceof UnauthorizedError) {
                    handleUnauthorized();
                } else {
                    throw e;
                }
            });
    };
}

export function useJoinGameSession() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameJoinAction);
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: string) => {
        return action.perform(gameId)
            .catch(e => {
                if (e instanceof UnauthorizedError) {
                    handleUnauthorized();
                } else {
                    throw e;
                }
            });
    };

}

export function useDeleteGameSession() {
    const action = AppConfig.di.get(AppConfig.DIQ.GameDeleteAction);
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: string) => {
        return action.perform(gameId)
            .catch(e => {
                if (e instanceof UnauthorizedError) {
                    handleUnauthorized();
                } else {
                    throw e;
                }
            });
    };
}

export function useConnectGameSession() {
    const navigate = useNavigate();
    return (gameId: string) => navigate("/game?id=" + gameId);
}
