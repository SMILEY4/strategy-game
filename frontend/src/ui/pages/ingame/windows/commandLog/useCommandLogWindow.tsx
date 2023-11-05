import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {CommandLogWindow} from "./CommandLogWindow";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {AppCtx} from "../../../../../appContext";
import {Command} from "../../../../../models/command";

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
        const entries: CommandLogEntry[] = CommandRepository.useCommands()
            .map(cmd => ({command: cmd}));
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


}