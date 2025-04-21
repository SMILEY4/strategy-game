import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./vertexDescriptorRenderGraphNode";

/**
 * Node to define a draw call
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class DrawRenderGraphNode extends RenderGraphNode<DrawRenderGraphNode> {

	private shaderNode: ShaderRenderGraphNode = null as any;
	private vertexDescriptorNode: VertexDescriptorRenderGraphNode = null as any;
	private clearColor: [number, number, number, number] = [0, 0, 0, 0];
	private scaling: number = 1;
	private blendFunction: ((gl: WebGL2RenderingContext) => void) | null = null;


	public withVertexDescriptor(vertexDescriptorNode: VertexDescriptorRenderGraphNode): DrawRenderGraphNode {
		this.vertexDescriptorNode = vertexDescriptorNode;
		return this;
	}

	public withShaderProgram(shaderNode: ShaderRenderGraphNode): DrawRenderGraphNode {
		this.shaderNode = shaderNode;
		return this;
	}

	public withClearColor(color: [number, number, number, number]): void {
		this.clearColor = color;
	}

	public withScaling(scaling: number): void {
		this.scaling = scaling;
	}

	public withBlendFunction(blendFunction: ((gl: WebGL2RenderingContext) => void) | null): void {
		this.blendFunction = blendFunction;
	}


	public getVertexDescriptorNode(): VertexDescriptorRenderGraphNode {
		return this.vertexDescriptorNode;
	}

	public getShaderNode(): ShaderRenderGraphNode {
		return this.shaderNode;
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


	getInputs(): RenderGraphNode<any>[] {
		return [this.vertexDescriptorNode, this.shaderNode];
	}

}