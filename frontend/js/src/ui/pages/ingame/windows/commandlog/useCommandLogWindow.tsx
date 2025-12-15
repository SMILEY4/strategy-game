import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import {UID} from "../../../../../common/uid";
import {WindowGroup} from "../windowGroups";
import {Command} from "../../../../../models/command/command";
import {CommandService} from "../../../../../app/game/command/command.service";
import {CommandStateAccess} from "../../../../../app/game/command/command.state-access";

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
			commands: CommandStateAccess.useCommands(),
			cancel: command => CommandService.cancelCommand(command.id),
		};
	}

}