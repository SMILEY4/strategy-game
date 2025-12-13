import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Command} from "../../../../../models/command/command";
import {CommandService} from "../../../../../app/game/command/game.command.service";
import {useCommands} from "../../../../../app/game/command/game.command.hook.commands";

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
			commands: useCommands(),
			cancel: command => CommandService.cancelCommand(command.id),
		};
	}

}