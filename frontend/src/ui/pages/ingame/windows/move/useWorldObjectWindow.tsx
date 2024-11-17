import {openWindow, useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import React, {useEffect} from "react";
import {MoveWindow} from "./MoveWindow";
import {useDI} from "../../../../../appContext";
import {WorldObject} from "../../../../../models/base/worldObject";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {MovementService} from "../../../../../logic/game/movementService";

export namespace UseMoveWindow {

	export function useOpen() {
		const WINDOW_ID = "move-command";
		const openWindow = useOpenWindow();
		return (worldObjectId: string) => {
			openWindow({
				id: WINDOW_ID,
				className: "move-window",
				bottom: 25,
				height: 160,
				width: 370,
				left: 1000,
				right: 1000,
				blockOthers: true,
				content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
			});
		};
	}

	export function open(worldObjectId: string) {
		const WINDOW_ID = "move-command";
		openWindow({
			id: WINDOW_ID,
			className: "move-window",
			bottom: 25,
			height: 160,
			width: 370,
			left: 1000,
			right: 1000,
			blockOthers: true,
			content: <MoveWindow windowId={WINDOW_ID} identifier={worldObjectId}/>,
		});
	}

	export interface Data {
		worldObject: WorldObject,
		remainingPoints: number,
		totalPoints: number
		cancel: () => void,
		accept: () => void
	}

	export function useData(worldObjectId: string | null): UseMoveWindow.Data | null {

		const _ = WorldObjectRepository.useCurrentMovementPath(); // force re-render on changes

		const worldObject = WorldObjectRepository.useById(worldObjectId);
		const movementService = useDI<MovementService>(MovementService.name);
		const closeWindow = useCloseWindow();

		useEffect(() => {
			if (worldObject) {
				movementService.startMovement(worldObject.id, worldObject.tile).then(_ => undefined);
			}
		}, []);

		if (worldObject) {
			return {
				worldObject: worldObject,
				remainingPoints: movementService.getMaxPathCost(worldObject) - movementService.getPathCost(),
				totalPoints: movementService.getMaxPathCost(worldObject),
				cancel: () => {
					movementService.cancelMovement();
					closeWindow("move-command");
				},
				accept: () => {
					movementService.completeMovement();
					closeWindow("move-command");
				},
			};
		} else {
			return null;
		}
	}

}