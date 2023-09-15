import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Command} from "../../../../../models/command";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../../../components/text/Text";
import {useCommandCancel, useCommands} from "../../../../hooks/game/commands";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {HBox} from "../../../../components/layout/hbox/HBox";


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
    const cancel = useCommandCancel();

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
                    <CommandEntry command={command} onCancel={() => cancel(command.id)}/>
                ))}
            </VBox>
        </DecoratedWindow>
    );
}

export function CommandEntry(props: { command: Command, onCancel: () => void }): ReactElement {
    return (
        <DecoratedPanel paper simpleBorder>
            <HBox centerVertical spaceBetween>
                <Text noShadow>{props.command.type}</Text>
                <ButtonPrimary red round small onClick={props.onCancel}>
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}
