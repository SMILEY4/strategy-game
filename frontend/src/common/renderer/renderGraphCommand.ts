import {RenderGraphResourceManager} from "./resources/renderGraphResourceManager";
import {RenderGraphContext} from "./renderGraphContext";

/**
 * an abstract command that performs a single action
 */
export abstract class RenderGraphCommand {

	private readonly changeKeys: string[];

	protected constructor(changeKeys: string[]) {
		this.changeKeys = changeKeys;
	}

	public execute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void {
		if (resourceManager.hasChange(this.changeKeys)) {
			this.onExecute(resourceManager, context);
		}
	}

	abstract onExecute(resourceManager: RenderGraphResourceManager, context: RenderGraphContext): void
}