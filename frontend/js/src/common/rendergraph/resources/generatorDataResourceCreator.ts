import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {DataGeneratorRenderGraphNode} from "../nodes/dataGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";

export class GeneratorDataResourceCreator<TResult> implements RenderGraphResourceCreator<DataGeneratorRenderGraphNode<any, any>> {

	constructor(
		private readonly appliesToCheck: (node: RenderGraphNode) => boolean,
		private readonly defaultValue: TResult,
		private readonly disposeFunction: (container: TResult) => void,
	) {
	}

	appliesTo(node: RenderGraphNode): boolean {
		return this.appliesToCheck(node);
	}

	create(node: DataGeneratorRenderGraphNode<any, any>, resourceManager: RenderGraphResourceManager): void {
		for (let output of node.getOutputDefinitions()) {
			const dataName = RenderGraphKeys.genericData(output);
			if (!resourceManager.hasResource(dataName)) {
				resourceManager.createResource<TResult>(
					dataName,
					this.defaultValue,
					this.disposeFunction,
				);
			}
		}
	}

}