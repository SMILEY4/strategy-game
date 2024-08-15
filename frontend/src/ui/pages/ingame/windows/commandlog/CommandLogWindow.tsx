import React, {ReactElement} from "react";
import {UseCommandLogWindow} from "./useCommandLogWindow";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {
	Command,
	CommandType,
	CreateSettlementDirectCommand,
	CreateSettlementWithSettlerCommand,
	MoveCommand,
} from "../../../../../models/command";
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
		return (
			<>
				<Header4 onLight>{command.id}</Header4>
				<Spacer size="s"/>
				<Text onLight>{command.id}</Text>
			</>
		);
	}

}