import {RenderGraphNode} from "../renderGraphNode";
import {VertexCreatorRenderGraphNode} from "./vertexCreatorRenderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

/**
 * Node to define data for a single vertex buffer
 *
 * Properties:
 * - vertex shader source
 * - fragment shader source
 *
 * Inputs:
 * - TextureRenderGraphNode: textures to bind
 * - VertexDescriptorRenderGraphNode: vertex data to use for drawing
 */
export class VertexBufferRenderGraphNode extends RenderGraphNode<VertexBufferRenderGraphNode> {

	private sources: VertexCreatorRenderGraphNode.Output[] = []

	public withInput(node: VertexCreatorRenderGraphNode.Output): VertexBufferRenderGraphNode {
		this.sources.push(node);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.sources.map(it => it.creator)
	}

	validate(): string[] {
		const errors: string[] = [];  // todo
		return errors;
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		const commands: IntermediateRenderGraphCommand[] = [];

		for (let source of this.sources) {
			commands.push(...source.creator.preCompile())
		}

		return commands;
	}

}