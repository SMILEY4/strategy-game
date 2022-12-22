import {LineElementInputData} from "./lineElementInputData";
import {LineElementOutputData} from "./lineElementOutputData";

export interface LineMeshConfig {
    points: number[][]
    thickness: number,
    capStartFunction: (data: LineElementInputData) => LineElementOutputData,
    capEndFunction: (data: LineElementInputData) => LineElementOutputData,
    joinFunction: (data: LineElementInputData) => LineElementOutputData,
    vertexBuilder: (currentPoint: number[], currentIndex: number, vertexData: number[]) => number[] // vertex data = (x,y,u,v)
}
