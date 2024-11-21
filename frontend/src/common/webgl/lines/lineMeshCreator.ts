import {Vec2d} from "../../vec2d";
import {LineElementInputData, SegmentType} from "./lineElementInputData";
import {LineMesh} from "./lineMesh";
import {LineMeshConfig} from "./lineMeshConfig";


export class LineMeshCreator {

    public create(lineConfig: LineMeshConfig): LineMesh {
        const linePointsAmount = lineConfig.points.length;
        if (linePointsAmount <= 1 || lineConfig.thickness <= 0) {
            return LineMesh.EMPTY_MESH;
        } else {
            const mesh = {
                vertices: [],
                triangles: [],
                lastAttachmentPoints: null
            };
            const totalLength = this.totalLength(lineConfig, linePointsAmount - 1);
            const linePoints = lineConfig.points;
            for (let i = 0; i < linePointsAmount; i++) {
                const lineElementInputData: LineElementInputData = {
                    segmentType: this.getSegmentType(i, linePointsAmount),
                    currentPoint: linePoints[i],
                    previousPoint: (i - 1 < 0) ? [] : linePoints[i - 1],
                    nextPoint: (i + 1 >= linePointsAmount) ? [] : linePoints[i + 1],
                    thickness: lineConfig.thickness,
                    halfThickness: lineConfig.thickness / 2,
                    currentLineLength: this.totalLength(lineConfig, i),
                    totalLineLength: totalLength,
                    index: i
                };
                this.createSegment(mesh, lineConfig, lineElementInputData);
            }

            return mesh;
        }
    }

    private totalLength(options: LineMeshConfig, upToIndex: number): number {
        let total = 0;
        const points = options.points;
        for (let i = 1; i <= upToIndex; i++) {
            const p0 = Vec2d.fromArray(points[i - 1]);
            const p1 = Vec2d.fromArray(points[i]);
            total = total + p0.distance(p1);
        }
        return total;
    }

    private getSegmentType(index: number, amountPoints: number): SegmentType {
        if (index === 0) return "start";
        if (index === amountPoints - 1) return "end";
        return "middle";
    }


    private createSegment(mesh: LineMesh, lineConfig: LineMeshConfig, data: LineElementInputData) {
        if (data.segmentType === "start") {
            this.buildStartSegment(mesh, lineConfig, data);
        }
        if (data.segmentType === "end") {
            this.createEndSegment(mesh, lineConfig, data);
        }
        if (data.segmentType === "middle") {
            this.createMiddleSegment(mesh, lineConfig, data);
        }
    }


    private buildStartSegment(mesh: LineMesh, lineConfig: LineMeshConfig, data: LineElementInputData) {
        const elementData = lineConfig.capStartFunction(data);
        mesh.vertices.push(...elementData.points.map(p => lineConfig.vertexBuilder(data.currentPoint, data.index, p)));
        mesh.triangles.push(...elementData.triangles);
        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2], elementData.attachmentIndices[3]];
    }


    private createEndSegment(mesh: LineMesh, lineConfig: LineMeshConfig, data: LineElementInputData) {
        const indexOffset = mesh.vertices.length;

        const elementData = lineConfig.capEndFunction(data);
        mesh.vertices.push(...elementData.points.map(p => lineConfig.vertexBuilder(data.currentPoint, data.index, p)));
        mesh.triangles.push(...elementData.triangles.map(t => t.map(i => i + indexOffset)));

        const ipp0 = mesh.lastAttachmentPoints!![0];
        const ipp1 = mesh.lastAttachmentPoints!![1];
        const ip0 = elementData.attachmentIndices[0] + indexOffset;
        const ip1 = elementData.attachmentIndices[1] + indexOffset;
        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );

        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2] + indexOffset, elementData.attachmentIndices[3] + indexOffset];
    }


    private createMiddleSegment(mesh: LineMesh, lineConfig: LineMeshConfig, data: LineElementInputData) {
        const indexOffset = mesh.vertices.length;

        const elementData = lineConfig.joinFunction(data);
        mesh.vertices.push(...elementData.points.map(p => lineConfig.vertexBuilder(data.currentPoint, data.index, p)));
        mesh.triangles.push(...elementData.triangles.map(t => t.map(i => i + indexOffset)));

        const ipp0 = mesh.lastAttachmentPoints!![0];
        const ipp1 = mesh.lastAttachmentPoints!![1];
        const ip0 = elementData.attachmentIndices[0] + indexOffset;
        const ip1 = elementData.attachmentIndices[1] + indexOffset;
        mesh.triangles.push(
            [ipp0, ipp1, ip1],
            [ipp0, ip0, ip1]
        );

        mesh.lastAttachmentPoints = [elementData.attachmentIndices[2] + indexOffset, elementData.attachmentIndices[3] + indexOffset];
    }


    /**
     * flatten the given mesh-object into a simple 2d-array - each vertex is a single entry/array
     */
    static flatten2d(mesh: LineMesh): number[][] {
        const data: number[][] = [];
        mesh.triangles.forEach(triangle => {
            data.push(mesh.vertices[triangle[0]]);
            data.push(mesh.vertices[triangle[1]]);
            data.push(mesh.vertices[triangle[2]]);
        });
        return data;
    }


    /**
     * flatten the given mesh-object into a simple 1d-array - all vertices are packed together
     */
    static flatten1d(mesh: LineMesh): number[] {
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


export namespace LineMeshCreator {

    export function defaultVertexBuilder(currentPoint: number[], currentIndex: number, vertexData: number[]): number[] {
        return vertexData;
    }

}