import {RenderGraphNode} from "../renderGraphNode";
import {TextureRenderGraphNode} from "./textureRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./renderTargetRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";
import {ConditionalRenderGraphNode} from "./conditionalRenderGraphNode";

export class ShaderRenderGraphNode extends RenderGraphNode<ShaderRenderGraphNode> {

	private vertexSource: string | null = null;
	private fragmentSource: string | null = null;

	private readonly properties: ({
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>,
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

	public withProperty(input: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>, bindingName: string): ShaderRenderGraphNode {
		this.properties.push({node: input, binding: bindingName});
		this.registerInput(input)
		return this;
	}

	public getVertexShaderSource(): string {
		return this.vertexSource!;
	}

	public getFragmentShaderSource(): string {
		return this.fragmentSource!;
	}

	public getProperties(): (TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>)[] {
		return this.properties.map(it => it.node);
	}

	public getPropertiesNamed(): {
		node: TextureRenderGraphNode | RenderTargetRenderGraphNode | PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> | ConditionalRenderGraphNode<any>;
		binding: string
	}[] {
		return this.properties;
	}

	validate(): string[] {
		return [];
	}

}

export namespace ShaderRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is ShaderRenderGraphNode {
		return node instanceof ShaderRenderGraphNode;
	}

}