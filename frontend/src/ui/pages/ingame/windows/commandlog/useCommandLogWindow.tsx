import {useDI} from "../../../../../appContext";
import {Command} from "../../../../../models/base/command";
import React from "react";
import {CommandLogWindow} from "./CommandLogWindow";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {CommandService} from "../../../../../logic/game/commandService";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";

export namespace UseCommandLogWindow {


    /**
     * Returns a function to open the command log window
     */
    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return () => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
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