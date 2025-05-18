import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export abstract class RenderGraphCommand {
	public abstract execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void;
	public abstract getDebugData(): any;
}