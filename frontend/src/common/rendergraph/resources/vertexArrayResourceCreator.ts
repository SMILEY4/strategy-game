import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {DrawRenderGraphNode} from "../nodes/drawRenderGraphNode";
import {GLVertexArray} from "../../webgl/glVertexArray";
import {ShaderRenderGraphNode} from "../nodes/shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "../nodes/vertexDescriptorRenderGraphNode";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import AttributeConfig = GLVertexArray.AttributeConfig;

export class VertexArrayResourceCreator implements RenderGraphResourceCreator<DrawRenderGraphNode> {

	constructor(
		private readonly gl: WebGL2RenderingContext
	) {}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof DrawRenderGraphNode;
	}

	create(node: DrawRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		const vertexDescriptorNode = node.getVertexDescriptorNode();
		const shaderNode = node.getShaderNode();

		const vertexArrayName = RenderGraphKeys.vertexArray(vertexDescriptorNode, shaderNode);
		if (!resourceManager.hasResource(vertexArrayName)) {
			const attributes = this.buildVertexAttributes(shaderNode, vertexDescriptorNode, resourceManager);
			const vertexArray = GLVertexArray.create(this.gl, attributes);
			resourceManager.createResource<GLVertexArray>(vertexArrayName, vertexArray, it => it.dispose());
		}
	}


	private buildVertexAttributes(shaderNode: ShaderRenderGraphNode, node: VertexDescriptorRenderGraphNode, resourceManager: RenderGraphResourceManager): AttributeConfig[] {
		const attributes: AttributeConfig[] = [];

		const shaderProgram = resourceManager.getResource<GLProgram>(RenderGraphKeys.shaderProgram(shaderNode));

		function getLocation(attribute: string): number {
			const info = shaderProgram.getInformation().attributes.find(a => a.name === attribute);
			if (info) {
				return info.location;
			} else {
				console.warn("Could not get location for attribute '" + attribute + "' from shader '" + shaderNode.getName() + "'.");
				return -1;
			}
		}

		for (let output of node.getVertexCreatorOutputs()) {
			const buffer = resourceManager.getResource<GLVertexBuffer>(RenderGraphKeys.vertexBuffer(output));
			attributes.push(...output.attributes.map(it => ({
				buffer: buffer,
				location: getLocation(it.name),
				type: it.type,
				amountComponents: it.amountComponents,
				normalized: it.normalized,
				stride: it.stride,
				offset: it.offset,
				divisor: it.divisor,
				debugName: it.name,
			})));
		}

		return attributes;
	}

}