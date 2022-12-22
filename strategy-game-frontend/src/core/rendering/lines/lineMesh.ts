export interface LineMesh {
    vertices: number[][], // list of points (x,y,u,v)
    triangles: number[][] // list of triangles (p0,p1,p2) -> index into points
    lastAttachmentPoints: number[] | null // two indices into vertices
}

export namespace LineMesh {

    export const EMPTY_MESH: LineMesh = {
        vertices: [],
        triangles: [],
        lastAttachmentPoints: null
    };

}