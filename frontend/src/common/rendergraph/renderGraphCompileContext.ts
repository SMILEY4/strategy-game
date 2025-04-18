import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderGraphCompiler} from "./renderGraphCompiler";

export class RenderGraphCompileContext {
	private readonly compiler: RenderGraphCompiler;
	private readonly nodes: RenderGraphNode<any>[];
	private readonly commands: RenderGraphCommand[];

	constructor(compiler: RenderGraphCompiler, nodes: RenderGraphNode<any>[], commands: RenderGraphCommand[]) {
		this.compiler = compiler;
		this.nodes = nodes;
		this.commands = commands;
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
}