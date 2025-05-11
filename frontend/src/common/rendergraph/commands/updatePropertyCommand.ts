import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UpdatePropertyCommand extends RenderGraphCommand {

	constructor(
		private readonly name: string,
		private readonly valueProvider: () => any,
		private readonly execCondition: () => boolean
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
			return;
		}
		resourceManager.updateResource(this.name, this.valueProvider());
	}

	getDebugData(): object {
		return {
			command: "UpdatePropertyCommand",
			property: this.name,
		};
	}
}