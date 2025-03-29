import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphNodeCompiler} from "../base/renderGraphNodeCompiler";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphResourceManager} from "../resources/renderGraphResourceManager";
import {NodeOutputDefinition} from "../inputoutput/nodeOutputDefinitions";
import {NodeInputDefinition} from "../inputoutput/nodeInputDefinitions";
import {GenericDataResource} from "../resources/genericDataResource";
import {RenderGraphContext} from "../renderGraphContext";

export class GenericDataNode extends RenderGraphNode {

	readonly actionFunc: (context: RenderGraphContext) => Map<string, any>;

	constructor(config: {
		/**
		 * Node inputs
		 */
		inputs: (NodeInputDefinition.ExternalChangeTrigger | NodeInputDefinition.GenericData)[],
		/**
		 * Node outputs
		 */
		outputs: NodeOutputDefinition.GenericData[],
		/**
		 * Function to execute.
		 * Keys returned in the map must be defined as DynamicDataOutputDefinition.
		 * If no entry for an output definition exists in returned map, the associated data is not touched.
		 */
		actionFunc: (context: RenderGraphContext) => Map<string, any>
	}) {
		super(config.inputs, config.outputs);
		this.actionFunc = config.actionFunc;
	}

}

export namespace GenericDataNode {

	/**
	 * Compiler of the node
	 */
	export class Compiler implements RenderGraphNodeCompiler {

		handles(node: RenderGraphNode): boolean {
			return node instanceof GenericDataNode;
		}

		validate(_: RenderGraphNode): string[] {
			return [];
		}

		compile(node: RenderGraphNode, _: RenderGraphCommand[]): RenderGraphCommand[] {
			const specificNode = node as GenericDataNode;
			const changeKeys = specificNode.inputs.flatMap(input => input.getChangeKeys());
			return [
				new GenericDataUpdateCommand(changeKeys, specificNode.actionFunc),
			];
		}

	}

	/**
	 * Command to update generic data
	 */
	export class GenericDataUpdateCommand extends RenderGraphCommand {

		private readonly actionFunc: (context: RenderGraphContext) => Map<string, any>;

		constructor(changeKeys: string[], actionFunc: (context: RenderGraphContext) => Map<string, any>) {
			super(changeKeys);
			this.actionFunc = actionFunc;
		}

		onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
			const modified = this.actionFunc(context);
			for (let [key, modifiedData] of modified) {
				const resource = resourceManager.requestResource<GenericDataResource<any>>(key);
				resource.data = modifiedData;
				resourceManager.markChange(key);
			}
		}

	}

}
