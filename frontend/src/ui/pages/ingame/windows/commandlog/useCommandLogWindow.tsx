import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {AppCtx} from "../../../../../appContext";
import {Command} from "../../../../../models/primitives/command";
import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {useQueryMultiple, useQuerySingleOrThrow} from "../../../../../shared/db/adapters/databaseHooks";
import {CommandDatabase} from "../../../../../state/database/commandDatabase";

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
		const entries: CommandLogEntry[] = useCommands().map(cmd => ({command: cmd}));
		const cancel = useCommandCancel();
		return {
			entries: entries,
			cancel: cancel,
		};
	}

	function useCommandCancel() {
		const commandService = AppCtx.CommandService();
		return (entry: CommandLogEntry) => commandService.cancelCommand(entry.command.id);
	}

	function useCommands(): Command[] {
		return useQueryMultiple(AppCtx.CommandDatabase(), CommandDatabase.QUERY_ALL, null);
	}

	function useCommandById(commandId: string): Command {
		return useQuerySingleOrThrow(AppCtx.CommandDatabase(), CommandDatabase.QUERY_BY_ID, commandId);
	}

}