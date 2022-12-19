import {Vec2d} from "../../../shared/vec2d";


export interface LineMesh {
    vertices: number[][], // list of points (x,y)
    triangles: number[][] // list of triangles (p0,p1,p2) -> index into points
    lastAttachmentPoints: number[] | null // two indices into vertices
}

export class LineMeshCreator {

    public create(line: [number, number][], thickness: number): LineMesh {
        const lineLength = line.length;
        if (lineLength <= 1 || thickness <= 0) {
            return {
                vertices: [],
                triangles: [],
                lastAttachmentPoints: null
            };
        } else {
            const mesh = {
                vertices: [],
                triangles: [],
                lastAttachmentPoints: null
            };

            for (let i = 0; i < lineLength; i++) {
                const prevPoint = (i - 1 < 0) ? null : line[i - 1];
                const currPoint = line[i];
                const nextPoint = (i + 1 >= lineLength) ? null : line[i + 1];
                this.createSegment(mesh, prevPoint, currPoint, nextPoint, thickness);
            }

            return mesh;
        }
    }


    /**
     * the last two added vertices must always be the attachment points for the next line segment (cw first, then ccw)
     */
    private createSegment(mesh: LineMesh, prevPoint: number[] | null, currPoint: number[], nextPoint: number[] | null, thickness: number) {
        if (!prevPoint) {
            this.buildStartSegment(mesh, currPoint, nextPoint!!, thickness);
        } else if (!nextPoint) {
            this.createEndSegment(mesh, prevPoint, currPoint, thickness);
        } else {
            this.createMiddleSegment(mesh, prevPoint!!, currPoint, nextPoint!!, thickness);
        }
    }

    private buildStartSegment(mesh: LineMesh, currPoint: number[], nextPoint: number[], thickness: number) {
        const elementData = LineSegmentBuilders.lineCapStartPointy(currPoint, nextPoint, thickness);
        mesh.vertices.push(...elementData.points);
        mesh.triangles.push(...elementData.triangles);
        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2], elementData.attachmentIndices[3]]
    }


    private createEndSegment(mesh: LineMesh, prevPoint: number[], currPoint: number[], thickness: number) {
        const indexOffset = mesh.vertices.length

        const elementData = LineSegmentBuilders.lineCapEndPointy(prevPoint, currPoint, thickness);
        mesh.vertices.push(...elementData.points);
        mesh.triangles.push(...elementData.triangles.map(t => t.map(i => i+indexOffset)));

        const ipp0 = mesh.lastAttachmentPoints!![0];
        const ipp1 = mesh.lastAttachmentPoints!![1];
        const ip0 = elementData.attachmentIndices[0] + indexOffset;
        const ip1 = elementData.attachmentIndices[1] + indexOffset;

        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );
        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2]+indexOffset, elementData.attachmentIndices[3]+indexOffset]
    }


    private createMiddleSegment(mesh: LineMesh, prevPoint: number[], currPoint: number[], nextPoint: number[], thickness: number) {
        const indexOffset = mesh.vertices.length

        const elementData = LineSegmentBuilders.lineJoinMiter(prevPoint, currPoint, nextPoint, thickness)
        mesh.vertices.push(...elementData.points);
        mesh.triangles.push(...elementData.triangles.map(t => t.map(i => i+indexOffset)));

        const ipp0 = mesh.lastAttachmentPoints!![0];
        const ipp1 = mesh.lastAttachmentPoints!![1];
        const ip0 = elementData.attachmentIndices[0] + indexOffset;
        const ip1 = elementData.attachmentIndices[1] + indexOffset;

        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );
        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2]+indexOffset, elementData.attachmentIndices[3]+indexOffset]

    }


    static flatten(mesh: LineMesh): number[] {
        const data: number[] = [];
        mesh.triangles.forEach(triangle => {
            data.push(
                ...mesh.vertices[triangle[0]], 1, 0, 0,
                ...mesh.vertices[triangle[1]], 0, 1, 0,
                ...mesh.vertices[triangle[2]], 0, 0, 1
            );
        });
        return data;
    }

}

export namespace LineSegmentBuilders {

    export interface LineElementData {
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

    export function lineCapStartButt(currPoint: number[], nextPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        return {
            points: [p0.toArray(), p1.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };

    }


    export function lineCapEndButt(prevPoint: number[], currPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        return {
            points: [p0.toArray(), p1.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };
    }


    export function lineCapStartSquare(currPoint: number[], nextPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const startPoint = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(-direction.x * (thickness/2), -direction.y * (thickness/2))
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).add(startPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).add(startPoint);
        return {
            points: [p0.toArray(), p1.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };

    }


    export function lineCapEndSquare(prevPoint: number[], currPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const endPoint = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(direction.x * (thickness/2), direction.y * (thickness/2))
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).add(endPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).add(endPoint);
        return {
            points: [p0.toArray(), p1.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };
    }


    export function lineCapStartPointy(currPoint: number[], nextPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p2 = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(-direction.x * (thickness/2), -direction.y * (thickness/2))
        return {
            points: [p0.toArray(), p1.toArray(), p2.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: [[0,1,2]]
        };

    }


    export function lineCapEndPointy(prevPoint: number[], currPoint: number[], thickness: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p2 = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(direction.x * (thickness/2), direction.y * (thickness/2))
        return {
            points: [p0.toArray(), p1.toArray(), p2.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: [[0,1,2]]
        };
    }


    export function lineJoinMiter(prevPoint: number[], currPoint: number[], nextPoint: number[], thickness: number): LineElementData {

        const directionIn = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const directionOut = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const direction = directionIn.copy().add(directionOut).normalize();

        const miter0 = direction.copy().rotate90DegClockwise();
        const miter1 = direction.copy().rotate90DegCounterClockwise();

        const miterHalfThickness = (thickness / 2) / miter0.dot(directionIn.copy().rotate90DegClockwise());

        const p0 = miter0.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);
        const p1 = miter1.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);

        return {
            points: [p0.toArray(), p1.toArray()],
            attachmentIndices: [0,1,0,1],
            triangles: []
        }
    }


}

