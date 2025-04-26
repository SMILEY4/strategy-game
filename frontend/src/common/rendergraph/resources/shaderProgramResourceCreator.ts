import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class ShaderProgramResourceCreator implements RenderGraphResourceCreator<ShaderRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ShaderRenderGraphNode;
	}

	create(node: ShaderRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		const programName = RenderGraphKeys.shaderProgram(node);
		if (resourceManager.hasResource(programName)) {
			return;
		}

		const program = GLProgram.create(this.gl, node.getVertexShaderSource(), node.getFragmentShaderSource());
		resourceManager.createResource<GLProgram>(programName, program, it => it.dispose());
	}

}