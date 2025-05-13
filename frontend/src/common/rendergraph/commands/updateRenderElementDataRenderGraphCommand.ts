import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderElementData} from "../resources/renderElementData";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {RenderElement} from "../nodes/renderElementGeneratorRenderGraphNode";

export class UpdateRenderElementDataRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly creatorName: string,
		private readonly creationFunc: (context: RenderGraphNodeContext) => Map<string, RenderElement[]>,
		private readonly execCondition: () => boolean,
		private readonly propertyMapping: Map<string, string>
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
			return;
		}
		const context = new RenderGraphNodeContext(resourceManager, this.propertyMapping);
		const result = this.creationFunc(context);
		for (let [key, data] of result) {
			const elementData = resourceManager.getResource<RenderElementData>(RenderGraphKeys.elementsDataFromName(this.creatorName, key));
			elementData.elements = data;
		}
	}

	getDebugData(): object {
		return {
			command: "UpdateRenderElementData",
			creator: this.creatorName,
			propertyMapping: this.propertyMapping,
		};
	}
}