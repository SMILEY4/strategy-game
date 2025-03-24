import {BaseRenderGraphSorter} from "../graph/baseRenderGraphSorter";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";
import {DrawRenderNode} from "../graph/nodes/drawRenderNode";
import {NodeInput} from "../graph/nodes/nodeInput";
import {VertexRenderNode} from "../graph/nodes/vertexRenderNode";
import {NodeOutput} from "../graph/nodes/nodeOutput";


export class WebGLRenderGraphSorter extends BaseRenderGraphSorter {

    getDependableInputResources(node: AbstractRenderNode): string[] {
        const resources: string[] = [];

        if (node instanceof DrawRenderNode) {
            resources.push(
                ...node.config.input
                    .filter(e => e instanceof NodeInput.RenderTarget)
                    .map(e => "rendertarget:" + (e as NodeInput.RenderTarget).renderTargetId),
            );
            resources.push(
                ...node.config.input
                    .filter(e => e instanceof NodeInput.VertexDescriptor)
                    .map(e => "vertexdescriptor:" + (e as NodeInput.VertexDescriptor).vertexDataId),
            );
        }

        if (node instanceof VertexRenderNode) {
            resources.push(
                ...node.config.input
                    .filter(e => e instanceof NodeInput.VertexBuffer)
                    .map(e => "vertexbuffer:" + (e as NodeInput.VertexBuffer).name),
            );
        }

        return resources
    }

    getDependableOutputResources(node: AbstractRenderNode): string[] {
        const resources: string[] = [];

        if (node instanceof DrawRenderNode) {
            resources.push(
                ...node.config.output
                    .filter(e => e instanceof NodeOutput.RenderTarget)
                    .map(e => "rendertarget:" + (e as NodeOutput.RenderTarget).renderTargetId),
            );
        }

        if (node instanceof VertexRenderNode) {
            resources.push(
                ...node.config.output
                    .filter(e => e instanceof NodeOutput.VertexDescriptor)
                    .map(e => "vertexdescriptor:" + (e as NodeOutput.VertexDescriptor).name),
            );
            resources.push(
                ...node.config.output
                    .filter(e => e instanceof NodeOutput.VertexBuffer)
                    .map(e => "vertexbuffer:" + (e as NodeOutput.VertexBuffer).name),
            );
        }

        return resources
    }


	getSharedInputResources(node: AbstractRenderNode): string[] {
		const resources: string[] = [];

		if (node instanceof DrawRenderNode) {
			resources.push(
				...node.config.input
					.filter(e => e instanceof NodeInput.RenderTarget)
					.map(e => "rendertarget:" + (e as NodeInput.RenderTarget).renderTargetId),
			);
			resources.push(
				...node.config.input
					.filter(e => e instanceof NodeInput.Texture)
					.map(e => "texture:" + (e as NodeInput.Texture).path),
			);
			resources.push(
				...node.config.input
					.filter(e => e instanceof NodeInput.ConditionalTexture)
					.flatMap(e => (e as NodeInput.ConditionalTexture<any>).paths.map(it => "texture:" + it.path)),
			);
		}

		return resources;
	}

}