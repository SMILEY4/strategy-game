export type SegmentType = "start" | "middle" | "end"

/**
 * The data required to build the mesh/vertices for line elements, i.e. caps and joins
 */
export interface LineElementInputData {
    segmentType: SegmentType,
    currentPoint: number[],
    previousPoint: number[],
    nextPoint: number[],
    thickness: number,
    halfThickness: number,
    currentLineLength: number,
    totalLineLength: number,
    index: number
}