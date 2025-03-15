import {useNavigate} from "react-router-dom";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {AuthHooks} from "../../hooks/authentication";
import {App} from "../../../appContext";

export namespace SessionHooks {

	export function useLoadGameSessions() {
		const handleUnauthorized = AuthHooks.useHandleUnauthorized();
		return () => {
			return App.interfaceService.listSessions()
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
					return [];
				}));
		};
	}

	export function useCreateGameSession() {
		const handleUnauthorized = AuthHooks.useHandleUnauthorized();
		return (name: string, seed: string | null) => {
			return App.interfaceService.createSession(name, seed)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};
	}

	export function useJoinGameSession() {
		const handleUnauthorized = AuthHooks.useHandleUnauthorized();
		return (gameId: string) => {
			return App.interfaceService.joinSession(gameId)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};

	}

	export function useDeleteGameSession() {
		const handleUnauthorized = AuthHooks.useHandleUnauthorized();
		return (gameId: string) => {
			return App.interfaceService.deleteSession(gameId)
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
		const handleUnauthorized = AuthHooks.useHandleUnauthorized();
		return (gameId: string) => {
			App.interfaceService.connectSession(gameId)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};
	}

}
