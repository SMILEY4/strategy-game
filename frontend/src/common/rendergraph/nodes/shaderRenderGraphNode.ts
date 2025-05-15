import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {PropertyRenderGraphNodeUtils, RenderGraphProperty} from "./propertyRenderGraphNode";
import {ResourceManager} from "../../../renderer/common/graph/resourceManager";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

/**
 * A shader program
 */
export class ShaderRenderGraphNode implements RenderGraphNode {

	private vertexSource: string | null = null;
	private fragmentSource: string | null = null;
	private name: string = UID.generate();

	private readonly properties: ({ node: RenderGraphProperty<any>, binding: string })[] = [];

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): RenderGraphNode {
		this.name = name
		return this;
	}

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
	public withProperty(input: RenderGraphProperty<any>, bindingName: string): ShaderRenderGraphNode {
		this.properties.push({node: input, binding: bindingName});
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
	public getProperties(): RenderGraphProperty<any>[] {
		return this.properties.map(it => it.node);
	}

	/**
	 * @return all additional input nodes with their binding names
	 */
	public getPropertiesNamed(): {
		node: RenderGraphProperty<any>;
		binding: string
	}[] {
		return this.properties;
	}

	getName(): string {
		return this.name;
	}

	getInputs(): RenderGraphNode[] {
		return this.properties.map(it => it.node);
	}

	getChangeTest(): (resourceManager: RenderGraphResourceManager) => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(
			this.properties.map(it => it.node.getChangeTest())
		)
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