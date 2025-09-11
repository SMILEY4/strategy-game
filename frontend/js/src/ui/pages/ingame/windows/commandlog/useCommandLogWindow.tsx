import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Command} from "../../../../../models/command/command";
import {App} from "../../../../../appContext";
import {GameStateHooks} from "../../../../../state/gameStateHooks";

export namespace UseCommandLogWindow {

	export function open() {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <CommandLogWindow windowId={windowId}/>,
		});
	}

	/**
	 * The data and functions required by the window
	 */
	export interface Data {
		commands: Command[];
		cancel: (command: Command) => void;
	}

	/**
	 * Provides the data and functions required by the window
	 */
	export function useData(): UseCommandLogWindow.Data {
		return {
			commands: GameStateHooks.useCommands(),
			cancel: command => App.gameProxy.commandCancel(command),
		};
	}

}