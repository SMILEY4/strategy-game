import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {RenderGraphCommand} from "./renderGraphCommand";

export class RenderGraphCompileContext {

	private readonly compiler: RenderGraphCompiler;
	private readonly nodes: RenderGraphNode<any>[];
	private readonly commands: RenderGraphCommand[];
	private readonly additional = new Map<string, any>();

	constructor(
		compiler: RenderGraphCompiler,
		nodes: RenderGraphNode<any>[],
		commands: RenderGraphCommand[],
		additional: Map<string, any>
	) {
		this.compiler = compiler;
		this.nodes = nodes;
		this.commands = commands;
		this.additional = additional;
	}

	public compile(node: RenderGraphNode<any>): RenderGraphCommand[] {
		return this.compiler.compile([node], false);
	}

	public getNodes(): RenderGraphNode<any>[] {
		return this.nodes;
	}

	public getCommands(): RenderGraphCommand[] {
		return this.commands;
	}

	public getAdditional<T>(key: string): T {
		return this.additional.get(key)! as T;
	}
}