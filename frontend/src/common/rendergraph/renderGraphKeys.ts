import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {ElementCreatorRenderGraphNode} from "./nodes/elementCreatorRenderGraphNode";
import {ContainerRenderGraphNode} from "./nodes/containerRenderGraphNode";

export namespace RenderGraphKeys {


	export function textureUnitHandler() {
		return "textureUnitHandler";
	}

	export function changeTracker() {
		return "changeTracker";
	}

	export function gl() {
		return "gl";
	}

	export function camera() {
		return "camera";
	}

	export function framebuffer(node: RenderTargetRenderGraphNode): string {
		return "framebuffer:" + node.getName();
	}

	export function texture(node: TextureRenderGraphNode): string {
		return "texture:" + node.getName();
	}

	export function shaderProgram(node: ShaderRenderGraphNode): string {
		return "shaderprogram:" + node.getName();
	}

	export function vertexArray(node: VertexDescriptorRenderGraphNode, shaderNode: ShaderRenderGraphNode): string {
		return "vertexarray:" + node.getName() + ":" + shaderNode.getName();
	}

	export function vertexInfo(output: VertexCreatorRenderGraphNode.Output): string {
		return vertexInfoFromName(output.creator.getName(), output.name);
	}

	export function vertexInfoFromName(creatorName: string, outputName: string): string {
		return "vertexinfo:" + creatorName + ":" + outputName;
	}

	export function vertexBuffer(output: VertexCreatorRenderGraphNode.Output): string {
		return vertexBufferFromName(output.creator.getName(), output.name);
	}

	export function vertexBufferFromName(creatorName: string, outputName: string): string {
		return "vertexbuffer:" + creatorName + ":" + outputName;
	}

	export function conditionalTexture(options: TextureRenderGraphNode[]): string {
		return "condtextures:" + options.map(it => texture(it)).join(",");
	}

	export function elementsData(output: ElementCreatorRenderGraphNode.Output): string {
		return elementsDataFromName(output.creator.getName(), output.name);
	}

	export function elementsDataFromName(creatorName: string, outputName: string): string {
		return "elementsdata:" + creatorName + ":" + outputName;
	}

	export function pooledHtmlElements(output: ElementCreatorRenderGraphNode.Output): string {
		return "htmlelementpool:" + output.creator.getName() + ":" + output.name;
	}

	export function cachedHtmlElement(node: ContainerRenderGraphNode): string {
		return "htmlelementcache:" + node.getElementId();
	}

}