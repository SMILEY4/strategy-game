import {Game} from "../../models/misc/game";
import {App} from "../../appContext";
import {UnauthorizedError} from "../../common/UnauthorizedError";
import {GotoHooks} from "../../ui/pages/goto";

export function useGameSessionConnect(): (gameId: Game.Id) => void {
    const handleUnauthorized = useHandleUnauthorized();
    return (gameId: Game.Id) => {
        App.gameProxy.connectSession(gameId)
            .catch(error => UnauthorizedError.handle(error, () => {
                handleUnauthorized();
            }));
    };
}

function useHandleUnauthorized() {
    const redirect = GotoHooks.useLoginRedirect("/login");
    return () => {
        redirect();
    };
}