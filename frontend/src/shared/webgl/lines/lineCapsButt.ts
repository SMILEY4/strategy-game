import {Vec2d} from "../../vec2d";
import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

/**
 * Functions for building line-caps of the type "butt"
 * => flat start/end, line starts/ends at the position of the first/last point
 */
export namespace LineCapsButt {

    export function start(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.currentPoint, data.nextPoint).normalize();
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        return {
            points: [[p0.x, p0.y, 0, 0], [p1.x, p1.y, 0, 1]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: []
        };

    }

    export function end(data: LineElementInputData): LineElementOutputData {
        const direction = Vec2d.fromToArray(data.previousPoint, data.currentPoint).normalize();
        const p0 = direction.copy().rotate90DegClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().scale(data.halfThickness).addArr(data.currentPoint);
        return {
            points: [[p0.x, p0.y, 1, 0], [p1.x, p1.y, 1, 1]],
            attachmentIndices: [0, 1, 0, 1],
            triangles: []
        };
    }

}