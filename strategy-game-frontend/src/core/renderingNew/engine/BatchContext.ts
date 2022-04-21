import {Camera} from "../../rendering/utils/camera";
import GLBuffer from "../../rendering/utils/glBuffer";

export interface BatchContext {
	gl: WebGL2RenderingContext,
	camera: Camera,
	arrays: {
		currentIndexOffset: number,
		indices: number[],
		vertexData: number[]
	},
	buffers: {
		indices: GLBuffer | null,
		vertexData: GLBuffer | null,
	}
}