export type SegmentType = "start" | "middle" | "end"

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