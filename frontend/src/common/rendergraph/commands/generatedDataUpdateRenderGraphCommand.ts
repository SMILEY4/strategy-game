import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GeneratedDataContainer} from "../resources/generatedDataContainer";

export class GeneratedDataUpdateRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly generatorName: string,
		private readonly generatorFunction: (context: RenderGraphNodeContext) => Map<string, any>,
		private readonly execCondition: () => boolean,
		private readonly propertyMapping: Map<string, string>,
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
			return;
		}
		const context = new RenderGraphNodeContext(resourceManager, this.propertyMapping);
		const result = this.generatorFunction(context);
		for (let [key, data] of result) {
			const dataContainer = resourceManager.getResource<GeneratedDataContainer<any>>(RenderGraphKeys.genericDataFromName(this.generatorName, key));
			dataContainer.data = data;
		}
	}

	getDebugData(): object {
		return {
			command: "GeneratedDataUpdate",
			creator: this.generatorName,
			propertyMapping: this.propertyMapping,
		};
	}
}