import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {
    Command,
    CreateSettlementCommand,
    PlaceScoutCommand,
    ProductionQueueAddCommand,
    ProductionQueueCancelCommand,
    UpgradeSettlementCommand,
} from "../../../../../models/command";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {CommandStateAccess} from "../../../../../state/access/CommandStateAccess";
import {AppCtx} from "../../../../../appContext";


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

    const commands = CommandStateAccess.useCommands();
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
                <VBox stretch>
                    {renderCommand(props.command)}
                </VBox>
                <ButtonPrimary red round small onClick={props.onCancel}>
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );

    function renderCommand(command: Command): any {
        if (command.type === "settlement.create") {
            const cmd = command as CreateSettlementCommand;
            return (
                <>
                    <Header4 onLight>{"Create " + (cmd.asColony ? "Colony" : "Settlement")}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{cmd.name}</i></Text>
                    <Text onLight>at <i>{cmd.tile.q + ", " + cmd.tile.r}</i></Text>
                </>
            );
        }
        if (command.type === "settlement.upgrade") {
            const cmd = command as UpgradeSettlementCommand;
            return (
                <>
                    <Header4 onLight>{"Upgrade Settlement"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{cmd.settlement.name}</i></Text>
                    <Text onLight>from tier <i>{cmd.currTier}</i> to <i>{cmd.tgtTier}</i></Text>
                </>
            );
        }
        if (command.type === "production-queue-entry.add") {
            const cmd = command as ProductionQueueAddCommand;
            return (
                <>
                    <Header4 onLight>{"Add to production queue"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>construct <i>{getProductionQueueAddCommandName(cmd)}</i></Text>
                    <Text onLight>in city <i>{cmd.city.name}</i></Text>
                </>
            );
        }
        if (command.type === "production-queue-entry.cancel") {
            const cmd = command as ProductionQueueCancelCommand;
            return (
                <>
                    <Header4 onLight>{"Cancel production queue entry"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>in city <i>{cmd.city.name}</i></Text>
                </>
            );
        }
        if (command.type === "scout.place") {
            const cmd = command as PlaceScoutCommand;
            return (
                <>
                    <Header4 onLight>Place Scout</Header4>
                    <Spacer size="s"/>
                    <Text onLight>{"at " + cmd.tile.q + ", " + cmd.tile.r}</Text>
                </>
            );
        }
        return (
            <>
                <Header4 onLight>{command.type}</Header4>
                <Spacer size="s"/>
                <Text onLight>{command.id}</Text>
            </>
        );
    }

}

function getProductionQueueAddCommandName(cmd: ProductionQueueAddCommand): string {
    switch (cmd.entry.type) {
        case "building":
            return cmd.entry.buildingData!.type.displayString;
        case "settler":
            return "Settler";

    }
}

function useCommandCancel() {
    const commandService = AppCtx.CommandService();
    return (id: string) => commandService.cancelCommand(id);
}