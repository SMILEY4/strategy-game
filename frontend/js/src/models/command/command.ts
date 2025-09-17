import {TileSummary} from "../tile/tileSummary";
import {BrandedId} from "../../common/brandedId";
import {WorldObject} from "../worldobject/worldObject";
import {UID} from "../../common/uid";

/**
 * A command given by the player in the current turn.
 */
export type Command = Command.Move | Command.Disband

export namespace Command {

	export type Id = BrandedId<string, "CommandId">;

	export function genId(): Id {
		return UID.generate() as Id
	}

	export enum Type {
		Move = "move",
		Disband = "disband"
	}

	export type Mapping = {
		[Type.Move]: Move,
		[Type.Disband]: Disband,
	}

	interface BaseCommand {
		type: Type,
		id: Id,
	}

	export interface Move extends BaseCommand {
		type: Type.Move;
		worldObjectId: WorldObject.Id
		path: TileSummary[],
	}


	export interface Disband extends BaseCommand {
		type: Type.Disband;
		worldObjectId: WorldObject.Id;
	}

}