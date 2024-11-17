import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {useDI} from "../../../../../appContext";
import {Command} from "../../../../../models/base/command";
import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {CommandService} from "../../../../../logic/game/commandService";

export namespace UseCommandLogWindow {

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

	export interface Data {
		entries: CommandLogEntry[];
		cancel: (entry: CommandLogEntry) => void;
	}

	export interface CommandLogEntry {
		command: Command,
	}

	export function useData(): UseCommandLogWindow.Data {
		const entries: CommandLogEntry[] = CommandRepository.useAll().map(cmd => ({command: cmd}));
		const cancel = useCancel();
		return {
			entries: entries,
			cancel: cancel,
		};
	}

	function useCancel() {
		const commandService = useDI<CommandService>(CommandService.name);
		return (entry: CommandLogEntry) => commandService.cancelCommand(entry.command.id);
	}


}