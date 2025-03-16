import React from "react";
import {DevWindow} from "./DevWindow";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {CameraEntity} from "../../../../../models/misc/cameraEntity";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";

export namespace UseDevWindow {

	export function open() {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <DevWindow windowId={windowId}/>,
		});
	}

	export interface Data {
		fullscreen: {
			enter: () => void,
			exit: () => void
		},
		webgl: {
			loose: () => void,
			restore: () => void
		},
		camera: CameraEntity,
	}

	export function useData(): UseDevWindow.Data {
		const camera = GameStateHooks.useCamera();
		const [enterFullscreen, exitFullscreen] = useFullscreen("root");
		const [looseWGLContext, restoreWGLContext] = useWebGlContext();
		return {
			fullscreen: {
				enter: enterFullscreen,
				exit: exitFullscreen,
			},
			webgl: {
				loose: looseWGLContext,
				restore: restoreWGLContext,
			},
			camera: camera,
		};
	}


	function useWebGlContext() {
		return [
			() => App.gameProxy.webglContextLoose(),
			() => App.gameProxy.webglContextRestore(),
		];
	}

}