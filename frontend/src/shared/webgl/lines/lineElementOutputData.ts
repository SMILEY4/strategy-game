/**
 * The output of a line element, i.e. caps, joins
 */
export interface LineElementOutputData {
    /**
     * all points for this cap/join,
     */
    points: number[][],
    /**
     * four indices into the points-array used to define the points where other segments can attach to, (before cw, ccw; after, cw, ccw)
     */
    attachmentIndices: number[]
    /**
     * indexing into the points-array
     */
    triangles: number[][],

}