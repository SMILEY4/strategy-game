import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class ShaderProgramResourceCreator implements RenderGraphResourceCreator<ShaderRenderGraphNode> {

	constructor(
		private readonly gl: WebGL2RenderingContext
	) {}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	create(node: ShaderRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		const programName = RenderGraphKeys.shaderProgram(node);
		if (!resourceManager.hasResource(programName)) {
			resourceManager.createResource<GLProgram>(
				programName,
				GLProgram.create(this.gl, node.getVertexShaderSource(), node.getFragmentShaderSource()),
				it => it.dispose()
			);
		}
	}

}