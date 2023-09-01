import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Command} from "../../../../../models/command";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../../../components/text/Text";
import {useCommands} from "../../../../hooks/game/commands";


export function useOpenCommandLogWindow() {
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

export interface CommandLogWindowProps {
    windowId: string;
}

export function CommandLogWindow(props: CommandLogWindowProps): ReactElement {

    const commands = useCommands();

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            className={"window-map"}
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent gap_s top stretch scrollable stableScrollbar>
                <Header1>Commands</Header1>
                <Spacer size="s"/>
                {commands.map(command => (
                    <CommandEntry command={command}/>
                ))}
            </VBox>
        </DecoratedWindow>
    );
}

export function CommandEntry(props: { command: Command }): ReactElement {
    return (
        <DecoratedPanel paper simpleBorder>
            <Text noShadow>{props.command.type}</Text>
        </DecoratedPanel>
    );
}
