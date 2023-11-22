import {Vec2d} from "../../vec2d";
import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

/**
 * Functions for building line-join of the type "miter"
 */
export namespace LineJoinMiter {

    export function join(data: LineElementInputData): LineElementOutputData {

        const directionIn = Vec2d.fromToArray(data.previousPoint, data.currentPoint).normalize();
        const directionOut = Vec2d.fromToArray(data.currentPoint, data.nextPoint).normalize();
        const direction = directionIn.copy().add(directionOut).normalize();

        const miter0 = direction.copy().rotate90DegClockwise();
        const miter1 = direction.copy().rotate90DegCounterClockwise();
        const miterHalfThickness = data.halfThickness / miter0.dot(directionIn.copy().rotate90DegClockwise());

        const p0 = miter0.scale(miterHalfThickness).addArr(data.currentPoint);
        const p1 = miter1.scale(miterHalfThickness).addArr(data.currentPoint);

        const progress = data.currentLineLength / data.totalLineLength

        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        }
    }

}