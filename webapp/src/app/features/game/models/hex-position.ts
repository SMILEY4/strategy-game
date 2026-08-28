/** Axial hex coordinates. */
export interface HexPosition {
    q: number,
    r: number,
}

export type ExtendedHexPosition = HexPosition & {
    chunkQ: number,
    chunkR: number
}

export const INVALID_HEX_POSITION = {q: 999999, r: 999999} satisfies HexPosition;