import React, {ReactElement} from "react";
import {UseCommandLogWindow} from "./useCommandLogWindow";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Button} from "../../../../components/button/Button";
import {CgClose} from "react-icons/cg";
import {Divider} from "../../../../components/divider/Divider";
import {IndentBox} from "../../../../components/layout/indent/IndentBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Else, If, Then} from "react-if";
import {Txt} from "../../../../components/text/Txt";
import {Command} from "../../../../../models/command/command";

export interface CommandLogWindowProps {
	windowId: string;
}

/**
 * Windows showing a list of all currently pending commands of this turn
 */
export function CommandLogWindow(props: CommandLogWindowProps): ReactElement {

	const data: UseCommandLogWindow.Data = UseCommandLogWindow.useData();

	return (
		<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
			<VBox padding_l gap_m fullSize>

				<Txt.Header1>
					<Txt.String>Commands</Txt.String>
				</Txt.Header1>

				<Divider line/>

				<If condition={data.commands.length > 0}>
					<Then>
						<InsetPanel shrink>
							<VBox padding_s gap_s fullSize scrollable>
								{data.commands.map(command => (
									<CommandEntry data={data} command={command} key={command.id}/>
								))}
							</VBox>
						</InsetPanel>
					</Then>
					<Else>
						<VBox fullSize>
							<Txt.Body secondary center>
								<Txt.String>No commands given this turn.</Txt.String>
							</Txt.Body>
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
					{commandEntryMapping[props.command.type](props.command as any)}
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
}

/**
 * Mapping from commands to react components
 */
const commandEntryMapping: {
	[K in Command.Type]: (command: Extract<Command, { type: K }>) => ReactElement
} = {
	[Command.Type.Move]: (cmd) => (
		<>
			<Txt.Header4>
				<Txt.String>Move Unit</Txt.String>
			</Txt.Header4>
			<Divider line/>
			<IndentBox>
				<Txt.Body>
					<Txt.String>{"world object " + cmd.worldObjectId}</Txt.String>
					<br/>
					<Txt.String>{"from " + cmd.path[0].position.q + "," + cmd.path[0].position.r}</Txt.String>
					<br/>
					<Txt.String>{"to " + cmd.path[cmd.path.length - 1].position.q + "," + cmd.path[cmd.path.length - 1].position.r}</Txt.String>
				</Txt.Body>
			</IndentBox>
		</>
	),
	[Command.Type.Disband]: (cmd) => (
		<>
			<Txt.Header4>
				<Txt.String>Disband Unit</Txt.String>
			</Txt.Header4>
			<Divider line/>
			<IndentBox>
				<Txt.Body>
					<Txt.String>{"world object " + cmd.worldObjectId}</Txt.String>
				</Txt.Body>
			</IndentBox>
		</>
	),
	[Command.Type.ConstructTileImprovement]: (cmd) => (
		<>
			<Txt.Header4>
				<Txt.String>Construct Tile Improvement</Txt.String>
			</Txt.Header4>
			<Divider line/>
			<IndentBox>
				<Txt.Body>
					<Txt.String>{"type " + cmd.tileImprovementType}</Txt.String>
					<br/>
					<Txt.String>{"by " + cmd.worldObjectId}</Txt.String>
				</Txt.Body>
			</IndentBox>
		</>
	),
	[Command.Type.CreateSettlement]: (cmd) => (
		<>
			<Txt.Header4>
				<Txt.String>Create Settlement</Txt.String>
			</Txt.Header4>
			<Divider line/>
			<IndentBox>
				<Txt.Body>
					<Txt.String>{"name " + cmd.name}</Txt.String>
					<br/>
					<Txt.String>{"at " + cmd.tile.position.q + "," + cmd.tile.position.r}</Txt.String>
					<br/>
					<Txt.String>{"by " + cmd.worldObjectId}</Txt.String>
				</Txt.Body>
			</IndentBox>
		</>
	),
};