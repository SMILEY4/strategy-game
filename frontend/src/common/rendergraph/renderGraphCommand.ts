import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export abstract class RenderGraphCommand {
	public abstract execute(resourceManager: RenderGraphResourceManager): void;
	public abstract getDebugData(): any;
}