import {RenderGraphNode} from "../renderGraphNode";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./renderTargetRenderGraphNode";

/**
 * Node to define a draw call using this shader
 *
 * Properties:
 * - vertex shader source
 * - fragment shader source
 *
 * Inputs:
 * - TextureRenderGraphNode: textures to bind
 * - VertexDescriptorRenderGraphNode: vertex data to use for drawing
 */
export class ShaderRenderGraphNode extends RenderGraphNode<ShaderRenderGraphNode> {

	private vertexSource: string | null = null;
	private fragmentSource: string | null = null;

	private readonly inputs: ({
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode,
		binding: string | undefined
	})[] = [];


	public withVertexShaderSource(source: string): ShaderRenderGraphNode {
		this.vertexSource = source;
		return this;
	}

	public withFragmentShaderSource(source: string): ShaderRenderGraphNode {
		this.fragmentSource = source;
		return this;
	}

	public withInput(input: TextureRenderGraphNode | RenderTargetRenderGraphNode, bindingName?: string): ShaderRenderGraphNode {
		this.inputs.push({node: input, binding: bindingName});
		return this;
	}

	public getVertexShaderSource(): string {
		return this.vertexSource!;
	}

	public getFragmentShaderSource(): string {
		return this.fragmentSource!;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs.map(it => it.node);
	}


}