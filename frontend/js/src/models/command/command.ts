import {TileSummary} from "../tile/tileSummary";
import {BrandedId} from "../../common/brandedId";
import {WorldObject} from "../worldobject/worldObject";
import {UID} from "../../common/uid";

/**
 * A command given by the player in the current turn.
 */
export type Command = Command.Move
	| Command.Disband
	| Command.ConstructTileImprovement
	| Command.CreateSettlement

export namespace Command {

	export type Id = BrandedId<string, "CommandId">;

	export function genId(): Id {
		return UID.generate() as Id;
	}

	export enum Type {
		Move = "move",
		Disband = "disband",
		ConstructTileImprovement = "construct-tile-improvement",
		CreateSettlement = "create-settlement"
	}

	export type Mapping = {
		[Type.Move]: Move,
		[Type.Disband]: Disband,
		[Type.ConstructTileImprovement]: ConstructTileImprovement
		[Type.CreateSettlement]: CreateSettlement
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

	export interface ConstructTileImprovement extends BaseCommand {
		type: Type.ConstructTileImprovement;
		worldObjectId: WorldObject.Id;
		tileImprovementType: string;
	}

	export interface CreateSettlement extends BaseCommand {
		type: Type.CreateSettlement;
		worldObjectId: WorldObject.Id;
		tile: TileSummary;
		name: string;
	}

}