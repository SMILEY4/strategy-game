export interface TilePosition {
    q: number,
    r: number
}

export namespace TilePosition {
	export const NOWHERE: TilePosition = {q: 9999999, r: 9999999}
}