import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {useDI} from "../../../../../appContext";
import {Command} from "../../../../../models/base/command";
import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {CommandService} from "../../../../../logic/game/commandService";

export namespace UseCommandLogWindow {

	/**
	 * Returns a function to open the command log window
	 */
	export function useOpen() {
		const WINDOW_ID = "menubar-window";
		const addWindow = useOpenWindow();
		return () => {
			addWindow({
				id: WINDOW_ID,
				className: "command-log-window",
				left: 25,
				top: 60,
				bottom: 25,
				width: 360,
				content: <CommandLogWindow windowId={WINDOW_ID}/>,
			});
		};
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
		const commands = CommandRepository.useAll();
		const cancel = useCancel();
		return {
			commands: commands,
			cancel: cancel,
		};
	}

	/**
	 * Returns a function to cancel a given command
	 */
	function useCancel() {
		const commandService = useDI<CommandService>(CommandService.name);
		return (command: Command) => commandService.cancelCommand(command.id);
	}

}