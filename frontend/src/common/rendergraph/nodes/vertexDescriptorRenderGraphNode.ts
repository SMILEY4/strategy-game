import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";
import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";

export class VertexDescriptorRenderGraphNode extends RenderGraphNode<VertexDescriptorRenderGraphNode> {

	private vertexCreatorOutputs: VertexCreatorRenderGraphNode.Output[] = [];


	public withInput(input: VertexCreatorRenderGraphNode.Output): VertexDescriptorRenderGraphNode {
		this.vertexCreatorOutputs.push(input);
		return this;
	}


	public getVertexCreatorOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return this.vertexCreatorOutputs;
	}


	getInputs(): RenderGraphNode<any>[] {
		return this.vertexCreatorOutputs
			.map(it => it.creator)
			.distinct();
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