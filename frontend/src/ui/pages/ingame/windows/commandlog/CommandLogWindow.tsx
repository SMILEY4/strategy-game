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
import {Button} from "../../../../components/button/primary/Button";
import {CgClose} from "react-icons/cg";
import {Divider} from "../../../../components/divider/Divider";
import {IndentBox} from "../../../../components/layout/indent/IndentBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
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
            <VBox padding_l gap_s fullSize>

                <Header1>Commands</Header1>

                <Divider line/>

                <If condition={data.commands.length > 0}>
                    <Then>
                        <InsetPanel shrink>
                            <VBox scrollable padding_s gap_s fullSize>
                                {data.commands.map(command => (
                                    <CommandEntry data={data} command={command} key={command.id}/>
                                ))}
                            </VBox>
                        </InsetPanel>
                    </Then>
                    <Else>
                        <VBox fullSize>
                            <Text secondary>No commands given this turn.</Text>
                        </VBox>
                    </Else>
                </If>

            </VBox>
        </DecoratedWindow>
    );
}


/**
 * A single issued and pending command
 */
export function CommandEntry(props: { data: UseCommandLogWindow.Data, command: Command }): ReactElement {
    return (
        <DecoratedPanel blue pattern>
            <HBox padding_m gap_s>
                <VBox grow shrink>
                    {renderCommand(props.command)}
                </VBox>
                <Button
                    warn circle small
                    dontGrow dontShrink
                    onClick={() => props.data.cancel(props.command)}
                >
                    <CgClose/>
                </Button>
            </HBox>
        </DecoratedPanel>
    );

    function renderCommand(command: Command): any {
        if (command.type == CommandType.MOVE) {
            const cmd = command as MoveCommand;
            return (
                <>
                    <Header4>{"Move Unit"}</Header4>
                    <Divider line/>
                    <IndentBox>
                        <Text>{"world-object-id: " + cmd.worldObjectId}</Text>
                        <Text>{"from " + cmd.path[0].q + "," + cmd.path[0].r + " to: " + cmd.path[cmd.path.length - 1].q + "," + cmd.path[cmd.path.length - 1].r}</Text>
                    </IndentBox>
                </>
            );
        }
        if (command.type == CommandType.CREATE_SETTLEMENT) {
            const cmd = command as CreateSettlement;
            return (
                <>
                    <Header4>{"Found Settlement"}</Header4>
                    <Divider line/>
                    <IndentBox>
                        <Text>{"with name " + cmd.name}</Text>
                        <Text>{"at " + cmd.tile.q + "," + cmd.tile.r}</Text>
                        <Text>{"by settler: " + cmd.worldObjectId}</Text>
                    </IndentBox>
                </>
            );
        }
        if (command.type == CommandType.PRODUCTION_QUEUE_ADD) {
            const cmd = command as ProductionQueueAddCommand;
            return (
                <>
                    <Header4>{"Add Production Queue"}</Header4>
                    <Divider line/>
                    <IndentBox>
                        <Text>{"produce " + "todo"}</Text>
                        <Text>{"in settlement " + cmd.settlement.name}</Text>
                    </IndentBox>
                </>
            );
        }
        if (command.type == CommandType.PRODUCTION_QUEUE_CANCEL) {
            const cmd = command as ProductionQueueCancelCommand;
            return (
                <>
                    <Header4>{"Cancel Production Queue"}</Header4>
                    <Divider line/>
                    <IndentBox>
                        <Text>{"cancel " + "todo"}</Text>
                        <Text>{"in settlement " + cmd.settlement.name}</Text>
                    </IndentBox>
                </>
            );
        }
        return (
            <>
                <Header4>{command.id}</Header4>
                <Divider line/>
                <IndentBox>
                    <Text>{command.id}</Text>
                </IndentBox>
            </>
        );
    }

}