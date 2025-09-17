import {useNavigate} from "react-router-dom";
import {UnauthorizedError} from "../../../common/UnauthorizedError";
import {App} from "../../../appContext";
import {GotoHooks} from "../goto";
import {Game} from "../../../models/misc/game";

export namespace SessionHooks {

	export function useLoadGameSessions() {
		const handleUnauthorized = useHandleUnauthorized();
		return () => {
			return App.gameProxy.listSessions()
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
					return [];
				}));
		};
	}

	export function useCreateGameSession() {
		const handleUnauthorized = useHandleUnauthorized();
		return (name: string, seed: string | null) => {
			return App.gameProxy.createSession(name, seed)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};
	}

	export function useJoinGameSession() {
		const handleUnauthorized = useHandleUnauthorized();
		return (gameId: Game.Id) => {
			return App.gameProxy.joinSession(gameId)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};

	}

	export function useDeleteGameSession() {
		const handleUnauthorized = useHandleUnauthorized();
		return (gameId: Game.Id) => {
			return App.gameProxy.deleteSession(gameId)
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
		const handleUnauthorized = useHandleUnauthorized();
		return (gameId: Game.Id) => {
			App.gameProxy.connectSession(gameId)
				.catch(error => UnauthorizedError.handle(error, () => {
					handleUnauthorized();
				}));
		};
	}

	export function useHandleUnauthorized() {
		const redirect = GotoHooks.useLoginRedirect("/login");
		return () => {
			redirect();
		};
	}

}
