import {RenderGraphNode} from "../renderGraphNode";
import {VertexBufferRenderGraphNode} from "./vertexBufferRenderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

export class VertexDescriptorRenderGraphNode extends RenderGraphNode<VertexDescriptorRenderGraphNode> {

	private buffers: VertexBufferRenderGraphNode[] = [];

	public withInput(input: VertexBufferRenderGraphNode): VertexDescriptorRenderGraphNode {
		this.buffers.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.buffers;
	}

	validate(): string[] {
		const errors: string[] = [];  // todo
		return errors;
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		const commands: IntermediateRenderGraphCommand[] = [];

		for (const buffer of this.buffers) {
			commands.push(...buffer.preCompile());
		}

		commands.push(new IntermediateRenderGraphCommand.BindVertexArray(this))

		return commands;
	}

}