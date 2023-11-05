import {Vec2d} from "../../vec2d";
import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

/**
 * Functions for building line-caps of the type "pointy"
 * => triangle at the start/end extruding half the thickness of the line
 */
export namespace LineCapsButt {

    export function start(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.currentPoint, data.nextPoint).normalize();
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p2 = Vec2d.fromArray(data.currentPoint).addXY(-direction.x * data.halfThickness, -direction.y * data.halfThickness);
        const progress = -data.halfThickness / data.totalLineLength;
        return {
            points: [[p0.x, p0.y, 0, 0], [p1.x, p1.y, 0, 1], [p2.x, p2.y, progress, 0.5]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: [[0, 1, 2]]
        };

    }

    export function end(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.previousPoint, data.currentPoint).normalize();
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p2 = Vec2d.fromArray(data.currentPoint).addXY(direction.x * data.halfThickness, direction.y * data.halfThickness);
        const progress = (data.currentLineLength + data.halfThickness) / data.totalLineLength;
        return {
            points: [[p0.x, p0.y, 1, 0], [p1.x, p1.y, 1, 1], [p2.x, p2.y, progress, 0.5]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: [[0, 1, 2]]
        };
    }

}