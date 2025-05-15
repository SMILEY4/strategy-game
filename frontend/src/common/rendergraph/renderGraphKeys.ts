import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexGeneratorRenderGraphNode, VertexGeneratorOutputDefinition} from "./nodes/vertexGeneratorRenderGraphNode";
import {
	RenderElementGeneratorOutputDefinition,
} from "./nodes/renderElementGeneratorRenderGraphNode";
import {ContainerRenderGraphNode} from "./nodes/containerRenderGraphNode";
import {RenderGraphProperty} from "./nodes/propertyRenderGraphNode";
import {ConditionalTextureRenderGraphNode} from "./nodes/conditionalTextureRenderGraphNode";
import {DataGeneratorOutputDefinition, DataGeneratorRenderGraphNode} from "./nodes/dataGeneratorRenderGraphNode";

export namespace RenderGraphKeys {


	export function textureUnitHandler() {
		return "textureUnitHandler";
	}

	export function gl() {
		return "gl";
	}

	export function frameId() {
		return "frameid";
	}

	export function framebuffer(node: RenderTargetRenderGraphNode): string {
		return "framebuffer:" + node.getName();
	}

	export function texture(node: TextureRenderGraphNode | ConditionalTextureRenderGraphNode): string {
		return "texture:" + node.getName();
	}

	export function shaderProgram(node: ShaderRenderGraphNode): string {
		return "shaderprogram:" + node.getName();
	}

	export function vertexArray(node: VertexDescriptorRenderGraphNode, shaderNode: ShaderRenderGraphNode): string {
		return "vertexarray:" + node.getName() + ":" + shaderNode.getName();
	}

	export function vertexInfo(output: VertexGeneratorOutputDefinition): string {
		return vertexInfoFromName(output.generator.getName(), output.name);
	}

	export function vertexInfoFromName(creatorName: string, outputName: string): string {
		return "vertexinfo:" + creatorName + ":" + outputName;
	}

	export function vertexBuffer(output: VertexGeneratorOutputDefinition): string {
		return vertexBufferFromName(output.generator.getName(), output.name);
	}

	export function vertexBufferFromName(creatorName: string, outputName: string): string {
		return "vertexbuffer:" + creatorName + ":" + outputName;
	}

	export function genericData(output: DataGeneratorOutputDefinition<any>): string {
		return genericDataFromName(output.generator.getName(), output.name);
	}

	export function genericDataFromName(creatorName: string, outputName: string): string {
		return "genericdata:" + creatorName + ":" + outputName;
	}

	export function pooledHtmlElements(output: RenderElementGeneratorOutputDefinition): string {
		return "htmlelementpool:" + output.generator.getName() + ":" + output.name;
	}

	export function cachedHtmlElement(node: ContainerRenderGraphNode): string {
		return "htmlelementcache:" + node.getElementId();
	}

	export function property(node: RenderGraphProperty<any>): string {
		return propertyFromName(node.getName())
	}

	export function propertyFromName(name: string): string {
		return "property:" + name;
	}

}