import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {
    AddProductionQueueCommand, CancelProductionQueueCommand,
    Command, CreateCityCommand, PlaceScoutCommand, UpgradeCityCommand,
} from "../../../../../models/command";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {CommandType} from "../../../../../models/commandType";
import {ProductionEntry, ProductionQueueEntry} from "../../../../../models/city";
import {AudioType} from "../../../../../logic/audio/audioService";


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

    const commands = CommandRepository.useCommands();
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
                <ButtonPrimary red round small onClick={props.onCancel} soundId={AudioType.CLICK_B.id}>
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );

    function renderCommand(command: Command): any {
        if (command.type === CommandType.CITY_CREATE) {
            const cmd = command as CreateCityCommand;
            return (
                <>
                    <Header4 onLight>{"Create " + (cmd.asColony ? "Colony" : "Settlement")}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{cmd.name}</i></Text>
                    <Text onLight>at <i>{cmd.tile.q + ", " + cmd.tile.r}</i></Text>
                </>
            );
        }
        if (command.type === CommandType.CITY_UPGRADE) {
            const cmd = command as UpgradeCityCommand;
            return (
                <>
                    <Header4 onLight>{"Upgrade Settlement"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{cmd.city.name}</i></Text>
                    <Text onLight>from tier <i>{cmd.currentTier}</i> to <i>{cmd.targetTier}</i></Text>
                </>
            );
        }
        if (command.type === CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as AddProductionQueueCommand;
            return (
                <>
                    <Header4 onLight>{"Add to production queue"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>construct <i>{getProductionEntryName(cmd.entry)}</i></Text>
                    <Text onLight>in city <i>{cmd.city.name}</i></Text>
                </>
            );
        }
        if (command.type === CommandType.PRODUCTION_QUEUE_CANCEL) {
            const cmd = command as CancelProductionQueueCommand;
            return (
                <>
                    <Header4 onLight>{"Cancel production queue entry"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{getProductionQueueEntryName(cmd.entry)}</i></Text>
                    <Text onLight>in city <i>{cmd.city.name}</i></Text>
                </>
            );
        }
        if (command.type === CommandType.SCOUT_PLACE) {
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
                <Header4 onLight>{command.type.id}</Header4>
                <Spacer size="s"/>
                <Text onLight>{command.id}</Text>
            </>
        );
    }

}

function getProductionEntryName(entry: ProductionEntry): string {
    switch (entry.type) {
        case "building":
            return entry.buildingData!.type.displayString;
        case "settler":
            return "Settler";

    }
}

function getProductionQueueEntryName(entry: ProductionQueueEntry): string {
    switch (entry.type) {
        case "building":
            return entry.buildingData!.type.displayString;
        case "settler":
            return "Settler";

    }
}

function useCommandCancel() {
    const commandService = AppCtx.CommandService();
    return (id: string) => commandService.cancelCommand(id);
}