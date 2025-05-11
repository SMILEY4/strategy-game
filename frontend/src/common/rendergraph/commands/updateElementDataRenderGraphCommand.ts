import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {ElementData} from "../resources/elementData";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";

export class UpdateElementDataRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly creatorName: string,
		private readonly creationFunc: (context: RenderGraphNodeContext) => ElementCreatorRenderGraphNode.ElementCreationFuncResult,
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
			const elementData = resourceManager.getResource<ElementData>(RenderGraphKeys.elementsDataFromName(this.creatorName, key));
			elementData.elements = data;
		}
	}

	getDebugData(): object {
		return {
			command: "UpdateElementData",
			creator: this.creatorName,
		};
	}
}