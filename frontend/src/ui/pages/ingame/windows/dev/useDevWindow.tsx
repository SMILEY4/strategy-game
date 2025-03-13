import React from "react";
import {DevWindow} from "./DevWindow";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {CameraData} from "../../../../../models/base/cameraData";
import {UseDevStatsWindow} from "../devstats/useDevStatsWindow";
import {useDI} from "../../../../../appContext";
import {CameraRepository} from "../../../../../state/repository/cameraRepository";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {InterfaceService} from "../../../../../logic/game/interfaceService";

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
		open: {
			devStats: () => void
		}
		fullscreen: {
			enter: () => void,
			exit: () => void
		},
		webgl: {
			loose: () => void,
			restore: () => void
		},
		camera: CameraData,
	}

	export function useData(): UseDevWindow.Data {
		const openDevStats = UseDevStatsWindow.useOpen();
		const camera = CameraRepository.useCamera();
		const [enterFullscreen, exitFullscreen] = useFullscreen("root");
		const [looseWGLContext, restoreWGLContext] = useWebGlContext();
		return {
			open: {
				devStats: openDevStats,
			},
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
		const service = useDI<InterfaceService>("InterfaceService");
		return [
			() => service.webglContextLoose(),
			() => service.webglContextRestore(),
		];
	}

}