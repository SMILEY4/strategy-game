import {Vec2d} from "../../../shared/vec2d";
import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

/**
 * Functions for building line-caps of the type "square"
 * => flat end extruding half the thickness of the line
 */
export namespace LineCapsSquare {

    export function start(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.currentPoint, data.nextPoint).normalize();
        const pOut = Vec2d.fromArray(data.currentPoint).addXY(-direction.x * data.halfThickness, -direction.y * data.halfThickness);
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).add(pOut);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).add(pOut);
        const progress = -data.halfThickness / data.totalLineLength;
        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: []
        };

    }

    export function end(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.previousPoint, data.currentPoint).normalize();
        const pOut = Vec2d.fromArray(data.currentPoint).addXY(direction.x * data.halfThickness, direction.y * data.halfThickness);
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).add(pOut);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).add(pOut);
        const progress = (data.currentLineLength + data.halfThickness) / data.totalLineLength;
        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: []
        };
    }

}