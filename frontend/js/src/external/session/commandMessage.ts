import {Command} from "../../models/command/command";

export type CommandMessage = CommandMessage.Move | CommandMessage.Disband

export namespace CommandMessage {

	export interface Move {
		type: "world-object-move"
		worldObjectId: string,
		path: ({
			id: string,
			position: {
				q: number,
				r: number
			}
		})[]
	}

	export interface Disband {
		type: "world-object-disband",
		worldObjectId: string,
	}

	type CommandMessageMapping = {
		[Command.Type.Move]: CommandMessage.Move;
		[Command.Type.Disband]: CommandMessage.Disband;
	};

	const mapping: {
		[K in Command.Type]: (command: Extract<Command, { type: K }>) => CommandMessageMapping[K]
	} = {
		[Command.Type.Move]: (cmd) => ({
			type: "world-object-move",
			worldObjectId: cmd.worldObjectId,
			path: cmd.path.map(it => ({
				id: it.id,
				position: {
					q: it.position.q,
					r: it.position.r,
				},
			})),
		}),
		[Command.Type.Disband]: (cmd) => ({
			type: "world-object-disband",
			worldObjectId: cmd.worldObjectId,
		}),
	};

	export function map<K extends Command.Type>(command: Extract<Command, { type: K }>): CommandMessageMapping[K] {
		return mapping[command.type](command as any);
	}

}
