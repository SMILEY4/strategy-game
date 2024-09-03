import React, {ReactElement} from "react";
import {UseCommandLogWindow} from "./useCommandLogWindow";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {
	Command,
	CommandType,
	CreateSettlementDirectCommand,
	CreateSettlementWithSettlerCommand,
	MoveCommand, ProductionQueueAddCommand, ProductionQueueCancelCommand,
} from "../../../../../models/primitives/command";
import {Text} from "../../../../components/text/Text";
import {Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import CommandLogEntry = UseCommandLogWindow.CommandLogEntry;
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";

export interface CommandLogWindowProps {
	windowId: string;
}

export function CommandLogWindow(props: CommandLogWindowProps): ReactElement {

	const data: UseCommandLogWindow.Data = UseCommandLogWindow.useData();

	return (
		<DefaultDecoratedWindowWithHeader windowId={props.windowId} title="Commands">
			{data.entries.map(commandEntry => (
				<CommandEntry data={data} entry={commandEntry} key={commandEntry.command.id}/>
			))}
		</DefaultDecoratedWindowWithHeader>
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
					onClick={() => props.data.cancel(props.entry)}	>
					<CgClose/>
				</ButtonPrimary>
			</HBox>
		</DecoratedPanel>
	);

	function renderCommand(command: Command): any {
		if(command.type == CommandType.MOVE) {
			const cmd = command as MoveCommand
			return (
				<>
					<Header4 onLight>{"Move Unit"}</Header4>
					<Spacer size="s"/>
					<Text onLight>{"world-object-id: " + cmd.worldObjectId}</Text>
					<Text onLight>{"from " + cmd.path[0].q + "," + cmd.path[0].r + " to: " + cmd.path[cmd.path.length-1].q + "," + cmd.path[cmd.path.length-1].r}</Text>
				</>
			)
		}
		if(command.type == CommandType.CREATE_SETTLEMENT_DIRECT) {
			const cmd = command as CreateSettlementDirectCommand
			return (
				<>
					<Header4 onLight>{"Found Settlement"}</Header4>
					<Spacer size="s"/>
					<Text onLight>{"with name " + cmd.name}</Text>
					<Text onLight>{"at " + cmd.tile.q + "," + cmd.tile.r}</Text>
				</>
			)
		}
		if(command.type == CommandType.CREATE_SETTLEMENT_WITH_SETTLER) {
			const cmd = command as CreateSettlementWithSettlerCommand
			return (
				<>
					<Header4 onLight>{"Found Settlement"}</Header4>
					<Spacer size="s"/>
					<Text onLight>{"with name " + cmd.name}</Text>
					<Text onLight>{"at " + cmd.tile.q + "," + cmd.tile.r}</Text>
					<Text onLight>{"by settler: " + cmd.worldObjectId}</Text>
				</>
			)
		}
		if(command.type == CommandType.PRODUCTION_QUEUE_ADD) {
			const cmd = command as ProductionQueueAddCommand
			return (
				<>
					<Header4 onLight>{"Add Production Queue"}</Header4>
					<Spacer size="s"/>
					<Text onLight>{"produce " + cmd.entry.optionType.name}</Text>
					<Text onLight>{"in settlement " + cmd.settlement.name}</Text>
				</>
			)
		}
		if(command.type == CommandType.PRODUCTION_QUEUE_CANCEL) {
			const cmd = command as ProductionQueueCancelCommand
			return (
				<>
					<Header4 onLight>{"Cancel Production Queue"}</Header4>
					<Spacer size="s"/>
					<Text onLight>{"cancel " + cmd.entry.optionType.name}</Text>
					<Text onLight>{"in settlement " + cmd.settlement.name}</Text>
				</>
			)
		}
		return (
			<>
				<Header4 onLight>{command.id}</Header4>
				<Spacer size="s"/>
				<Text onLight>{command.id}</Text>
			</>
		);
	}

}