/** Axial hex coordinates. */
export interface HexPosition {
    q: number,
    r: number,
}

export type ExtendedHexPosition = HexPosition & {
    chunkQ: number,
    chunkR: number
}