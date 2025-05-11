import {RenderGraphNode} from "../renderGraphNode";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./renderTargetRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";
import {ConditionalRenderGraphNode} from "./conditionalRenderGraphNode";

/**
 * A shader program
 */
export class ShaderRenderGraphNode extends RenderGraphNode<ShaderRenderGraphNode> {

	private vertexSource: string | null = null;
	private fragmentSource: string | null = null;

	private readonly properties: ({
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>,
		binding: string
	})[] = [];


	/**
	 * Specify the source code of the vertex shader
	 * @param source the source code as a string.
	 */
	public withVertexShaderSource(source: string): ShaderRenderGraphNode {
		this.vertexSource = source;
		return this;
	}

	/**
	 * Specify the source code of the fragment shader
	 * @param source the source code as a string.
	 */
	public withFragmentShaderSource(source: string): ShaderRenderGraphNode {
		this.fragmentSource = source;
		return this;
	}

	/**
	 * Define an additional input for this shader. The input value can be accessed in the shader via the given binding name. Properties must provide a valid type.
	 * @param input the property, texture, ...
	 * @param bindingName the binding name for this input
	 */
	public withProperty(input: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>, bindingName: string): ShaderRenderGraphNode {
		this.properties.push({node: input, binding: bindingName});
		this.registerInput(input)
		return this;
	}

	/**
	 * @return the source code of the vertex shader
	 */
	public getVertexShaderSource(): string {
		return this.vertexSource!;
	}

	/**
	 * @return the source code of the fragment shader
	 */
	public getFragmentShaderSource(): string {
		return this.fragmentSource!;
	}

	/**
	 * @return all additional input nodes
	 */
	public getProperties(): (TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>)[] {
		return this.properties.map(it => it.node);
	}

	/**
	 * @return all additional input nodes with their binding names
	 */
	public getPropertiesNamed(): {
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>;
		binding: string
	}[] {
		return this.properties;
	}

	validate(): string[] {
		const errors: string[] = []

		if(!this.vertexSource) {
			errors.push("A valid vertex shader source must be provided.")
		}

		if(!this.fragmentSource) {
			errors.push("A valid fragment shader source must be provided.")
		}

		if(this.properties.map(it => it.binding).distinct().length !== this.properties.length) {
			errors.push("Inputs must not have duplicate binding names.")
		}

		return errors;
	}

}

export namespace ShaderRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is ShaderRenderGraphNode {
		return node instanceof ShaderRenderGraphNode;
	}

}