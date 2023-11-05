/**
 * the data (vertices, triangles) for a mesh of a line
 */
export interface LineMesh {
    /**
     * lists of vertices with the data defined by "LineMeshConfig.vertexBuilder"
     */
    vertices: number[][],
    /**
     * the list of triangles, i.e. list of three indices into the vertex-array
     * */
    triangles: number[][]
    /**
     * internal use: the attachment points/indices of the last segment
     */
    lastAttachmentPoints: number[] | null
}

export namespace LineMesh {

    /**
     * A default empty line-mesh
     */
    export const EMPTY_MESH: LineMesh = {
        vertices: [],
        triangles: [],
        lastAttachmentPoints: null
    };

}