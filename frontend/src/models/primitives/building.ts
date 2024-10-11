import {TileIdentifier} from "./tile";

export interface Building {
	type: string,
	workedTile: TileIdentifier | null
	active: boolean
}