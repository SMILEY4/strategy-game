import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

/**
 * Configuration for building a mesh for a line
 */
export interface LineMeshConfig {
	/**
	 * the list of points (must be at least 2)
	 */
	points: number[][]
	/**
	 * the thickness of the line
	 */
	thickness: number,
	/**
	 * the function for building the starting line cap
	 */
	capStartFunction: (data: LineElementInputData) => LineElementOutputData,
	/**
	 * the function for building the ending line cap
	 */
	capEndFunction: (data: LineElementInputData) => LineElementOutputData,
	/**
	 * the function for building the joins
	 */
	joinFunction: (data: LineElementInputData) => LineElementOutputData,
	/**
	 * the function for providing the vertex data - pass through the given vertex data or enhance/modify
	 * @param currentPoint the (x,y) of the point in the line
	 * @param currentIndex the index in the line / list of points
	 * @param vertexData (x,y,u,v).
	 *      x,y are world positions,
	 *      u,v are texture coordinates along the line -
	 *          u in range [0,1] pointing from the start of the line towards the end and
	 *          v in range [0,1] pointing across the width of the line.
	 * */
	vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => number[]
}