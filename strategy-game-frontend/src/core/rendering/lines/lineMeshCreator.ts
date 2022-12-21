import {Vec2d} from "../../../shared/vec2d";
import LineElementData = LineSegmentBuilders.LineElementData;


export interface LineOptions {
    points: number[][]
    thickness: number,
    capStartFunction: (currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number) => LineElementData,
    capEndFunction: (prevPoint: number[], currPoint: number[], thickness: number, currentLength: number, totalLength: number) => LineElementData,
    joinFunction: (prevPoint: number[], currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number) => LineElementData,
    vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => number[] // vertex data = (x,y,u,v)
}

export interface LineMesh {
    vertices: number[][], // list of points (x,y,u,v)
    triangles: number[][] // list of triangles (p0,p1,p2) -> index into points
    lastAttachmentPoints: number[] | null // two indices into vertices
}

export class LineMeshCreator {

    public create(line: LineOptions): LineMesh {
        const linePointsAmount = line.points.length;
        if (linePointsAmount <= 1 || line.thickness <= 0) {
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
            const totalLength = this.totalLength(line, linePointsAmount-1)
            const linePoints = line.points
            for (let i = 0; i < linePointsAmount; i++) {
                const currentLength = this.totalLength(line, i)
                const prevPoint = (i - 1 < 0) ? null : linePoints[i - 1];
                const currPoint = linePoints[i];
                const nextPoint = (i + 1 >= linePointsAmount) ? null : linePoints[i + 1];
                this.createSegment(mesh, i, prevPoint, currPoint, nextPoint, line, currentLength, totalLength);
            }

            return mesh;
        }
    }

    private totalLength(options: LineOptions, upToIndex: number): number {
        let total = 0
        const points = options.points
        for(let i=1; i<=upToIndex; i++) {
            const p0 = Vec2d.fromArray(points[i-1])
            const p1 = Vec2d.fromArray(points[i-0])
            total = total + p0.distance(p1)
        }
        return total;
    }


    private createSegment(mesh: LineMesh, index: number, prevPoint: number[] | null, currPoint: number[], nextPoint: number[] | null, options: LineOptions, currentLength: number, totalLength: number) {
        if (!prevPoint) {
            this.buildStartSegment(mesh, index, currPoint, nextPoint!!, options, currentLength, totalLength);
        } else if (!nextPoint) {
            this.createEndSegment(mesh, index, prevPoint, currPoint, options, currentLength, totalLength);
        } else {
            this.createMiddleSegment(mesh, index, prevPoint!!, currPoint, nextPoint!!, options, currentLength, totalLength);
        }
    }


    private buildStartSegment(mesh: LineMesh, index: number, currPoint: number[], nextPoint: number[], options: LineOptions, currentLength: number, totalLength: number) {
        const elementData = options.capStartFunction(currPoint, nextPoint, options.thickness, currentLength, totalLength);
        mesh.vertices.push(...elementData.points.map(p => options.vertexBuilder(currPoint, -1, p)));
        mesh.triangles.push(...elementData.triangles);
        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2], elementData.attachmentIndices[3]]
    }


    private createEndSegment(mesh: LineMesh, index: number, prevPoint: number[], currPoint: number[], options: LineOptions, currentLength: number, totalLength: number) {
        const indexOffset = mesh.vertices.length

        const elementData = options.capEndFunction(prevPoint, currPoint, options.thickness, currentLength, totalLength);
        mesh.vertices.push(...elementData.points.map(p => options.vertexBuilder(currPoint, -1, p)));
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


    private createMiddleSegment(mesh: LineMesh, index: number, prevPoint: number[], currPoint: number[], nextPoint: number[], options: LineOptions, currentLength: number, totalLength: number) {
        const indexOffset = mesh.vertices.length

        const elementData = options.joinFunction(prevPoint, currPoint, nextPoint, options.thickness, currentLength, totalLength)
        mesh.vertices.push(...elementData.points.map(p => options.vertexBuilder(currPoint, -1, p)));
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
                ...mesh.vertices[triangle[0]],
                ...mesh.vertices[triangle[1]],
                ...mesh.vertices[triangle[2]],
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

    export function lineCapStartButt(currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        return {
            points: [[p0.x, p0.y, 0, 0], [p1.x, p1.y, 0, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };

    }


    export function lineCapEndButt(prevPoint: number[], currPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        return {
            points: [[p0.x, p0.y, 1, 0], [p1.x, p1.y, 1, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };
    }


    export function lineCapStartSquare(currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const startPoint = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(-direction.x * (thickness/2), -direction.y * (thickness/2))
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).add(startPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).add(startPoint);
        const progress = -(thickness/2) / totalLength
        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };

    }


    export function lineCapEndSquare(prevPoint: number[], currPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const endPoint = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(direction.x * (thickness/2), direction.y * (thickness/2))
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).add(endPoint);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).add(endPoint);
        const progress = (currentLength+(thickness/2)) / totalLength
        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        };
    }


    export function lineCapStartPointy(currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p2 = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(-direction.x * (thickness/2), -direction.y * (thickness/2))
        const progress = -(thickness/2) / totalLength
        return {
            points: [[p0.x, p0.y, 0, 0], [p1.x, p1.y, 0, 1], [p2.x, p2.y, progress, 0.5]],
            attachmentIndices: [0,1,0,1],
            triangles: [[0,1,2]]
        };

    }


    export function lineCapEndPointy(prevPoint: number[], currPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {
        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p2 = Vec2d.fromXY(currPoint[0], currPoint[1]).addXY(direction.x * (thickness/2), direction.y * (thickness/2))
        const progress = (currentLength+(thickness/2)) / totalLength
        return {
            points: [[p0.x, p0.y, 1, 0], [p1.x, p1.y, 1, 1], [p2.x, p2.y, progress, 0.5]],
            attachmentIndices: [0,1,0,1],
            triangles: [[0,1,2]]
        };
    }


    export function lineJoinMiter(prevPoint: number[], currPoint: number[], nextPoint: number[], thickness: number, currentLength: number, totalLength: number): LineElementData {

        const directionIn = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const directionOut = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const direction = directionIn.copy().add(directionOut).normalize();

        const miter0 = direction.copy().rotate90DegClockwise();
        const miter1 = direction.copy().rotate90DegCounterClockwise();

        const miterHalfThickness = (thickness / 2) / miter0.dot(directionIn.copy().rotate90DegClockwise());

        const p0 = miter0.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);
        const p1 = miter1.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);

        const progress = currentLength / totalLength

        return {
            points: [[p0.x, p0.y, progress, 0], [p1.x, p1.y, progress, 1]],
            attachmentIndices: [0,1,0,1],
            triangles: []
        }
    }

    export function defaultVertexBuilder(currentPoint: number[], currentIndex: number, vertexData: number[]): number[] {
        return vertexData
    }


}

