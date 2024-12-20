import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeInput} from "../../common/graph/nodeInput";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {GameWebGLRenderContext} from "../gameWebGLRenderContext";


export class TilesWaterDrawNode extends DrawRenderNode<GameWebGLRenderContext> {

	public static readonly ID = "drawnode.tileswater";

	constructor() {
		super({
			id: TilesWaterDrawNode.ID,
			input: [
				new NodeInput.ClearColor({
					clearColor: [0, 0, 0, 0],
				}),
				new NodeInput.BlendMode({
					func: gl => gl.blendFuncSeparate(
						gl.SRC_ALPHA,
						gl.ONE_MINUS_SRC_ALPHA,
						gl.ONE,
						gl.ONE_MINUS_SRC_ALPHA),
				}),
				new NodeInput.Texture({
					path: "/textures/groundSplotches.png",
					binding: "u_texture",
				}),
				new NodeInput.Shader({
					vertexId: "water.vert",
					fragmentId: "water.frag",
				}),
				new NodeInput.VertexDescriptor({
					id: "vertexdata.water",
				}),
				new NodeInput.Property({
					binding: "u_viewProjection",
					type: GLUniformType.MAT3,
					valueConstant: null,
					valueProvider: context => context.camera.getViewProjectionMatrixOrThrow(),
				}),
			],
			output: [
				new NodeOutput.RenderTarget({
					renderTargetId: "rendertarget.tileswater",
					depth: false,
					scale: 1,
				}),
			],
		});
	}
}