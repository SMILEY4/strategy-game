import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";
import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";

export class VertexDescriptorRenderGraphNode extends RenderGraphNode<VertexDescriptorRenderGraphNode> {

	private vertexCreatorOutputs: VertexCreatorRenderGraphNode.Output[] = [];


	public withInput(source: VertexCreatorRenderGraphNode.Output): VertexDescriptorRenderGraphNode {
		this.vertexCreatorOutputs.push(source);
		this.registerInput(source.creator)
		return this;
	}


	public getVertexCreatorOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return this.vertexCreatorOutputs;
	}

	validate(): string[] {
		return [];
	}

}

export namespace VertexDescriptorRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is VertexDescriptorRenderGraphNode {
		return node instanceof VertexDescriptorRenderGraphNode;
	}

}


/**
 * The configuration for a single vertex attribute
 */
export interface VertexAttribute {
	name: string,
	type: GLAttributeType,
	amountComponents: GLAttributeComponentAmount,
	normalized?: boolean,
	stride?: number,
	offset?: number,
	divisor?: number,
}

export interface VertexMetaInfo {
	type: "vertices" | "instances"
	entryCount: number,
}