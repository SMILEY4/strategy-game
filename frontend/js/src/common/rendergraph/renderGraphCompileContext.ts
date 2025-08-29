import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";

export class RenderGraphCompileContext {


	constructor(
		private readonly compiler: RenderGraphCompiler,
		private readonly resourceManager: RenderGraphResourceManager,
		private readonly nodes: RenderGraphNode[],
		private readonly commands: RenderGraphCommand[],
		private readonly compileResources: Map<string, any>
	) {
	}

	public getResourceManager(): RenderGraphResourceManager {
		return this.resourceManager;
	}

	public compile(node: RenderGraphNode): RenderGraphCommand[] {
		return this.compiler.compile([node], this.compileResources, false, this.resourceManager);
	}

	public getNodes(): RenderGraphNode[] {
		return this.nodes;
	}

	public getCommands(): RenderGraphCommand[] {
		return this.commands;
	}

	public getCompileResource<T>(key: string): T {
		return this.compileResources.get(key)! as T;
	}
}