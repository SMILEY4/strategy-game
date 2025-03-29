import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphNodeCompiler} from "../base/renderGraphNodeCompiler";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphResourceManager} from "../resources/renderGraphResourceManager";
import {WebGLResourceManager} from "../../../renderer/common/webgl/webGLResourceManager";
import {NodeInputDefinition} from "../inputoutput/nodeInputDefinitions";
import {NodeOutputDefinition} from "../inputoutput/nodeOutputDefinitions";
import {VertexBufferResource} from "../resources/vertexBufferResource";
import {VertexInfoResource} from "../resources/vertexInfoResource";
import {RenderGraphContext} from "../renderGraphContext";

export class VertexDataNode extends RenderGraphNode {

	readonly actionFunc: (context: RenderGraphContext) => VertexDataNode.VertexOutput;

	constructor(config: {
		/**
		 * Node inputs
		 */
		inputs: (NodeInputDefinition.ExternalChangeTrigger | NodeInputDefinition.GenericData | NodeInputDefinition.VertexBuffer)[],
		/**
		 * Node outputs
		 */
		outputs: (NodeOutputDefinition.VertexBuffer | NodeOutputDefinition.VertexDescriptor)[],
		/**
		 * function called
		 */
		actionFunc: (context: RenderGraphContext) => VertexDataNode.VertexOutput
	}) {
		super(config.inputs, config.outputs);
		this.actionFunc = config.actionFunc;
	}

}

export namespace VertexDataNode {

	export class VertexOutput {
		public readonly buffers: Map<string, BufferOutput>;
		public readonly outputs: Map<string, { vertexCount: number, instanceCount: number }>;

		constructor(params: {
			buffers: Map<string, BufferOutput>,
			outputs: Map<string, { vertexCount: number; instanceCount: number }>
		}) {
			this.buffers = params.buffers;
			this.outputs = params.outputs;
		}
	}

	export class BufferOutput {
		public readonly data: ArrayBuffer;

		constructor(data: ArrayBuffer) {
			this.data = data;
		}
	}


	/**
	 * Compiler of the node
	 */
	export class Compiler implements RenderGraphNodeCompiler {

		handles(node: RenderGraphNode): boolean {
			return node instanceof VertexDataNode;
		}

		validate(_: RenderGraphNode): string[] {
			return [];
		}

		compile(node: RenderGraphNode, _: RenderGraphCommand[]): RenderGraphCommand[] {
			const specificNode = node as VertexDataNode;
			const changeKeys = specificNode.inputs.flatMap(input => input.getChangeKeys());
			return [
				new VertexDataUpdateCommand(changeKeys, specificNode.actionFunc),
			];
		}

	}

	/**
	 * Command to update vertex data
	 */
	export class VertexDataUpdateCommand extends RenderGraphCommand {

		private readonly actionFunc: (context: RenderGraphContext) => VertexDataNode.VertexOutput;

		constructor(changeKeys: string[], actionFunc: (context: RenderGraphContext) => VertexDataNode.VertexOutput) {
			super(changeKeys);
			this.actionFunc = actionFunc;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const modified = this.actionFunc(context);
			for (let [key, modifiedData] of modified.buffers) {
				const buffer = resourceManager.requestResource<VertexBufferResource>(key).buffer;
				buffer.setData(modifiedData.data, true);
			}
			for (let [key, modifiedData] of modified.outputs) {
				const data = resourceManager.requestResource<VertexInfoResource>(key);
				data.vertexCount = modifiedData.vertexCount;
				data.instanceCount = modifiedData.instanceCount;
			}
		}

	}

}
