import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Updates the resource value of a property
 */
export class UpdatePropertyCommand extends RenderGraphCommand {

	private readonly name: string;
	private readonly provider: () => any;

	constructor(name: string, provider: () => any) {
		super();
		this.name = name;
		this.provider = provider;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		resourceManager.updateResource(this.name, this.provider());
	}

	getDebugData(): object {
		return {
			command: "UpdatePropertyCommand",
			property: this.name,
		};
	}
}