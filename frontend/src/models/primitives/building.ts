import {TileIdentifier} from "./tile";
import {DetailsLogEntry} from "./detailLog";

export interface Building {
	type: string,
	workedTile: TileIdentifier | null
	active: boolean,
	details: DetailsLogEntry[]
}