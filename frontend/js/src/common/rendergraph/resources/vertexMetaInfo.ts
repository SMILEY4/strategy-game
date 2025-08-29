/**
 * Additional information about vertex data (i.e. a vertex creator output)
 */
export interface VertexMetaInfo {
	type: "vertices" | "instances"
	entryCount: number,
}