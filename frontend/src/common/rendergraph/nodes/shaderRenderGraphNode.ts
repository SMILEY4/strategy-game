import {RenderGraphNode} from "../renderGraphNode";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./renderTargetRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";

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

	private readonly properties: ({
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any>,
		binding: string
	})[] = [];


	public withVertexShaderSource(source: string): ShaderRenderGraphNode {
		this.vertexSource = source;
		return this;
	}

	public withFragmentShaderSource(source: string): ShaderRenderGraphNode {
		this.fragmentSource = source;
		return this;
	}

	public withProperty(input: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any>, bindingName: string): ShaderRenderGraphNode {
		this.properties.push({node: input, binding: bindingName});
		return this;
	}

	public getVertexShaderSource(): string {
		return this.vertexSource!;
	}

	public getFragmentShaderSource(): string {
		return this.fragmentSource!;
	}

	public getProperties(): (TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any>)[] {
		return this.properties.map(it => it.node);
	}

	public getPropertiesNamed(): {
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any>;
		binding: string
	}[] {
		return this.properties;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.properties.map(it => it.node);
	}


}