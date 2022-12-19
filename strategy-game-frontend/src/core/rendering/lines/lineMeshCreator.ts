import {Vec2d} from "../../../shared/vec2d";


export interface LineMesh {
    vertices: number[][], // list of points (x,y)
    triangles: number[][] // list of triangles (p0,p1,p2) -> index into points
}

export class LineMeshCreator {

    public create(line: [number, number][], thickness: number): LineMesh {
        const lineLength = line.length;
        if (lineLength <= 1 || thickness <= 0) {
            return {
                vertices: [],
                triangles: []
            };
        } else {
            const mesh = {
                vertices: [],
                triangles: []
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
            this.createStartSegment(mesh, currPoint, nextPoint!!, thickness);
        } else if (!nextPoint) {
            this.createEndSegment(mesh, prevPoint, currPoint, thickness);
        } else {
            this.createMiddleSegment(mesh, prevPoint!!, currPoint, nextPoint!!, thickness);
        }
    }

    private createStartSegment(mesh: LineMesh, currPoint: number[], nextPoint: number[], thickness: number) {
        const direction = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        mesh.vertices.push(
            [p0.x, p0.y],
            [p1.x, p1.y]
        );
    }


    private createEndSegment(mesh: LineMesh, prevPoint: number[], currPoint: number[], thickness: number) {
        const index = mesh.vertices.length - 1;
        const ipp0 = index - 1;
        const ipp1 = index - 0;
        const ip0 = index + 1;
        const ip1 = index + 2;

        const direction = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const p0 = direction.copy().rotate90DegClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        const p1 = direction.copy().rotate90DegCounterClockwise().setLength(thickness / 2).addXY(currPoint[0], currPoint[1]);
        mesh.vertices.push(
            [p0.x, p0.y],
            [p1.x, p1.y]
        );

        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );
    }


    private createMiddleSegment(mesh: LineMesh, prevPoint: number[], currPoint: number[], nextPoint: number[], thickness: number) {
        const index = mesh.vertices.length - 1;
        const ipp0 = index - 1;
        const ipp1 = index - 0;
        const ip0 = index + 1;
        const ip1 = index + 2;


        const directionIn = Vec2d.fromTo(prevPoint[0], prevPoint[1], currPoint[0], currPoint[1]).normalize();
        const directionOut = Vec2d.fromTo(currPoint[0], currPoint[1], nextPoint[0], nextPoint[1]).normalize();
        const direction = directionIn.copy().add(directionOut).normalize()

        const miter0 = direction.copy().rotate90DegClockwise()
        const miter1 = direction.copy().rotate90DegCounterClockwise()

        const miterHalfThickness = (thickness / 2) / miter0.dot(directionIn.copy().rotate90DegClockwise());

        const p0 = miter0.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);
        const p1 = miter1.setLength(miterHalfThickness).addXY(currPoint[0], currPoint[1]);
        mesh.vertices.push(
            [p0.x, p0.y],
            [p1.x, p1.y]
        );

        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );

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
