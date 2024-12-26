import React, {ReactElement} from "react";
import {UseCommandLogWindow} from "./useCommandLogWindow";
import {
    Command,
    CommandType,
    CreateSettlement,
    MoveCommand,
    ProductionQueueAddCommand,
    ProductionQueueCancelCommand,
} from "../../../../../models/base/command";
import {Text} from "../../../../components/text/Text";
import {Header1, Header4} from "../../../../components/header/Header";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {Divider} from "../../../../components/divider/Divider";
import {IndentPanel} from "../../../../components/panels/indent/IndentPanel";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Else, If, Then} from "react-if";

export interface CommandLogWindowProps {
    windowId: string;
}

/**
 * Windows showing a list of all currently pending commands of this turn
 */
export function CommandLogWindow(props: CommandLogWindowProps): ReactElement {

    const data: UseCommandLogWindow.Data = UseCommandLogWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <Header1>{"Commands"}</Header1>
            <Spacer size="s"/>

            <If condition={data.commands.length > 0}>
                <Then>
                    <InsetPanel fillParent hideOverflow noPadding>
                        <VBox fillParent gap_s top stretch padding_xs>
                            {data.commands.map(command => (
                                <CommandEntry data={data} command={command} key={command.id}/>
                            ))}
                        </VBox>
                    </InsetPanel>
                </Then>
                <Else>
                    <VBox center fillParent>
                        <Text type="secondary">No commands given this turn.</Text>
                    </VBox>
                </Else>
            </If>
        </DecoratedWindow>
    );
}


/**
 * A single issued and pending command
 */
export function CommandEntry(props: { data: UseCommandLogWindow.Data, command: Command }): ReactElement {
    return (
        <DecoratedPanel simpleBorder accent="blue">
            <HBox centerVertical gap_s>
                <VBox stretch fillParentWidth>
                    {renderCommand(props.command)}
                </VBox>
                <ButtonPrimary
                    warn round small
                    onClick={() => props.data.cancel(props.command)}>
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );

    function renderCommand(command: Command): any {
        if (command.type == CommandType.MOVE) {
            const cmd = command as MoveCommand;
            return (
                <>
                    <Header4>{"Move Unit"}</Header4>
                    <Divider type="simple"/>
                    <IndentPanel>
                        <Text>{"world-object-id: " + cmd.worldObjectId}</Text>
                        <Text>{"from " + cmd.path[0].q + "," + cmd.path[0].r + " to: " + cmd.path[cmd.path.length - 1].q + "," + cmd.path[cmd.path.length - 1].r}</Text>
                    </IndentPanel>
                </>
            );
        }
        if (command.type == CommandType.CREATE_SETTLEMENT) {
            const cmd = command as CreateSettlement;
            return (
                <>
                    <Header4>{"Found Settlement"}</Header4>
                    <Divider type="simple"/>
                    <IndentPanel>
                        <Text>{"with name " + cmd.name}</Text>
                        <Text>{"at " + cmd.tile.q + "," + cmd.tile.r}</Text>
                        <Text>{"by settler: " + cmd.worldObjectId}</Text>
                    </IndentPanel>
                </>
            );
        }
        if (command.type == CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as ProductionQueueAddCommand;
            return (
                <>
                    <Header4>{"Add Production Queue"}</Header4>
                    <Divider type="simple"/>
                    <IndentPanel>
                        <Text>{"produce " + "todo"}</Text>
                        <Text>{"in settlement " + cmd.settlement.name}</Text>
                    </IndentPanel>
                </>
            );
        }
        if (command.type == CommandType.PRODUCTION_QUEUE_CANCEL) {
            const cmd = command as ProductionQueueCancelCommand;
            return (
                <>
                    <Header4>{"Cancel Production Queue"}</Header4>
                    <Divider type="simple"/>
                    <IndentPanel>
                        <Text>{"cancel " + "todo"}</Text>
                        <Text>{"in settlement " + cmd.settlement.name}</Text>
                    </IndentPanel>
                </>
            );
        }
        return (
            <>
                <Header4>{command.id}</Header4>
                <Divider type="simple"/>
                <IndentPanel>
                    <Text>{command.id}</Text>
                </IndentPanel>
            </>
        );
    }

}