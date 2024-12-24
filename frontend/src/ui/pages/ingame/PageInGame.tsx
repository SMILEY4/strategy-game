import React, {ReactElement, useEffect} from "react";
import {useQuery} from "../../components/headless/useQuery";
import {Canvas} from "./canvas/Canvas";
import {MenuBar} from "./menubar/MenuBar";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../components/text/Text";
import "./pageInGame.scoped.less";
import {SessionRepository} from "../../../state/repository/sessionRepository";
import {SessionHooks} from "../sessions/sessions";
import {useDI} from "../../../appContext";
import {GameSessionService} from "../../../logic/session/gameSessionService";
import {WindowStack} from "../../components/window_new/WindowStack";
import {useOpenWindow} from "../../components/window_new/windowHooks";

const USE_DUMMY_CANVAS = true;

export function PageInGame(): ReactElement {
	const currentState = SessionRepository.useGameSessionState();
	const loadGame = useLoadGame();

	useEffect(() => {
		loadGame();
	}, []);

	if (currentState === "loading") {
		return <GameLoading/>;
	} else if (currentState === "playing") {
		return <GamePlaying/>;
	} else {
		return <GameError/>;
	}
}

function GameLoading(): ReactElement {
	return (
		<BackgroundPanel fillParent centerContent>
			<DecoratedPanel>
				<Text>Loading ...</Text>
			</DecoratedPanel>
		</BackgroundPanel>
	);
}

function GameError(): ReactElement {
	return (
		<BackgroundPanel fillParent centerContent>
			<DecoratedPanel>
				<Text>An unexpected error occurred.</Text>
			</DecoratedPanel>
		</BackgroundPanel>
	);
}

function GamePlaying(): ReactElement {

	const sessionService = useDI<GameSessionService>(GameSessionService.name);

	const openWindow = useOpenWindow()

	// openWindow({
	// 	id: "test-1",
	// 	anchor: "left-edge",
	// 	content: (
	// 		<div style={{
	// 			backgroundColor: "blue",
	// 			color: "white",
	// 			fontSize: "2rem",
	// 			width: "100%",
	// 			height: "100%"
	// 		}}>
	// 			Hello test-1
	// 		</div>
	// 	),
	// })
	//
	// openWindow({
	// 	id: "test-2",
	// 	anchor: "right-edge",
	// 	content: (
	// 		<div style={{
	// 			backgroundColor: "blue",
	// 			color: "white",
	// 			fontSize: "2rem",
	// 			width: "100%",
	// 			height: "100%"
	// 		}}>
	// 			Hello test-2
	// 		</div>
	// 	),
	// })

	// openWindow({
	// 	id: "test-3",
	// 	anchor: "bottom-edge",
	// 	content: (
	// 		<div style={{
	// 			backgroundColor: "blue",
	// 			color: "white",
	// 			fontSize: "2rem",
	// 			width: "100%",
	// 			height: "100%"
	// 		}}>
	// 			Hello test-3
	// 		</div>
	// 	),
	// })
	//
	// openWindow({
	// 	id: "test-4",
	// 	anchor: "top-edge",
	// 	content: (
	// 		<div style={{
	// 			backgroundColor: "blue",
	// 			color: "white",
	// 			fontSize: "2rem",
	// 			width: "100%",
	// 			height: "100%"
	// 		}}>
	// 			Hello test-4
	// 		</div>
	// 	),
	// })

	// openWindow({
	// 	id: "test-5",
	// 	anchor: "bottom-right",
	// 	content: (
	// 		<div style={{
	// 			backgroundColor: "blue",
	// 			color: "white",
	// 			fontSize: "2rem",
	// 			width: "100%",
	// 			height: "100%"
	// 		}}>
	// 			Hello test-5
	// 		</div>
	// 	),
	// })

	openWindow({
		id: "test-6",
		anchor: "center",
		content: (
			<div style={{
				backgroundColor: "blue",
				color: "white",
				fontSize: "2rem",
				width: "100%",
				height: "100%"
			}}>
				Hello test-6
			</div>
		),
	})

	useEffect(() => {
		window.onbeforeunload = endGamePlaying
		window.onunload = endGamePlaying
		return () => {
			window.onbeforeunload = null
			window.onunload = null
			endGamePlaying()
		}
	}, []);

	function endGamePlaying() {
		sessionService.disconnectSession().then(undefined)
	}

	return (
		<div className="page-ingame page-ingame--playing">
			{
				USE_DUMMY_CANVAS
					? <div className="dummy-canvas"/>
					: <Canvas/>
			}
			<MenuBar/>
			<WindowStack/>
		</div>
	);
}


function useLoadGame() {
	const connect = SessionHooks.useConnectGameSession();
	const queryParams = useQuery();
	return () => {
		const paramGameId = queryParams.get("id")!!;
		connect(paramGameId);
	};
}
