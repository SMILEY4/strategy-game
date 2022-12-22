export interface LineElementOutputData {
    /**
     * all points for this cap/join,
     * if only two points:
     * - the two points in the following order: cw-point with [x,y], ccw-point with [x,y]
     * - of more than two: the first two points are the attachment-points for the segment before,
     *          and the last two points for the segment after that (in order: cw then ccw)
     */
    points: number[][],
    /**
     * four indices into the points-array starting at "0", (before cw, ccw, after, cw, ccw)
     */
    attachmentIndices: number[]
    /**
     * indexing into the points-array (starting with "0")
     */
    triangles: number[][],

}
