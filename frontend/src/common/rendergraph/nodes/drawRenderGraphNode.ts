import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./vertexDescriptorRenderGraphNode";

export class DrawRenderGraphNode extends RenderGraphNode<DrawRenderGraphNode> {

	private clearColor: [number, number, number, number] = [0, 0, 0, 0];
	private scaling: number = 1;
	private blendFunction: ((gl: WebGL2RenderingContext) => void) | null = null;


	public withVertexDescriptor(vertexDescriptorNode: VertexDescriptorRenderGraphNode): DrawRenderGraphNode {
		this.registerInput(vertexDescriptorNode);
		return this;
	}

	public withShaderProgram(shaderNode: ShaderRenderGraphNode): DrawRenderGraphNode {
		this.registerInput(shaderNode);
		return this;
	}

	public withClearColor(color: [number, number, number, number]): DrawRenderGraphNode {
		this.clearColor = color;
		return this;
	}

	public withScaling(scaling: number): DrawRenderGraphNode {
		this.scaling = scaling;
		return this;
	}

	public withBlendFunction(blendFunction: ((gl: WebGL2RenderingContext) => void) | null): DrawRenderGraphNode {
		this.blendFunction = blendFunction;
		return this;
	}

	public getVertexDescriptorNode(): VertexDescriptorRenderGraphNode {
		return this
			.getInputs()
			.find(VertexDescriptorRenderGraphNode.isType)!!
	}

	public getShaderNode(): ShaderRenderGraphNode {
		return this
			.getInputs()
			.find(ShaderRenderGraphNode.isType)!!
	}

	public getClearColor(): [number, number, number, number] {
		return this.clearColor;
	}

	public getScaling(): number {
		return this.scaling;
	}

	public getBlendFunction(): ((gl: WebGL2RenderingContext) => void) | null {
		return this.blendFunction;
	}

	validate(): string[] {
		const errors: string[] = [];

		if(this.getInputs().count(ShaderRenderGraphNode.isType) != 1) {
			errors.push("Not exactly one shader node")
		}

		if(this.getInputs().count(VertexDescriptorRenderGraphNode.isType) != 1) {
			errors.push("Not exactly one vertex descriptor node")
		}

		return errors;
	}


}