import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    Command,
    CreateCityCommand,
    PlaceScoutCommand,
    UpgradeCityCommand,
} from "../../../../../models/command";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {CommandType} from "../../../../../models/commandType";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UseCommandLogWindow} from "./useCommandLogWindow";
import CommandLogEntry = UseCommandLogWindow.CommandLogEntry;


export interface CommandLogWindowProps {
    windowId: string;
}

export function CommandLogWindow(props: CommandLogWindowProps): ReactElement {

    const data: UseCommandLogWindow.Data = UseCommandLogWindow.useData();

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
                {data.entries.map(commandEntry => (
                    <CommandEntry data={data} entry={commandEntry} key={commandEntry.command.id}/>
                ))}
            </VBox>
        </DecoratedWindow>
    );
}

export function CommandEntry(props: { data: UseCommandLogWindow.Data, entry: CommandLogEntry }): ReactElement {
    return (
        <DecoratedPanel paper simpleBorder>
            <HBox centerVertical spaceBetween>
                <VBox stretch>
                    {renderCommand(props.entry.command)}
                </VBox>
                <ButtonPrimary
                    red round small
                    onClick={() => props.data.cancel(props.entry)}
                    soundId={AudioType.CLICK_CLOSE.id
                    }>
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
                    <Header4 onLight>{"Create " + (cmd.province === null ? "Colony" : "Settlement")}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>with name <i>{cmd.name}</i></Text>
                    {cmd.province && (<Text onLight>in province <i>{cmd.province.name}</i></Text>)}
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
                    <Text onLight>from tier <i>{cmd.currentTier.displayString}</i> to <i>{cmd.targetTier.displayString}</i></Text>
                </>
            );
        }
        if (command.type === CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as AddProductionQueueCommand;
            return (
                <>
                    <Header4 onLight>{"Add to production queue"}</Header4>
                    <Spacer size="s"/>
                    <Text onLight>construct <i>{cmd.entry.displayString}</i></Text>
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
                    <Text onLight>with name <i>{cmd.entry.displayName}</i></Text>
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