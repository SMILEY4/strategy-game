import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCommand} from "./renderGraphCommand";

export class RenderGraphCompileContext {
	private readonly _nodes: RenderGraphNode<any>[];
	private readonly _commands: RenderGraphCommand[];

	constructor(nodes: RenderGraphNode<any>[], commands: RenderGraphCommand[]) {
		this._nodes = nodes;
		this._commands = commands;
	}


	public getNodes(): RenderGraphNode<any>[] {
		return this._nodes;
	}

	public getCommands(): RenderGraphCommand[] {
		return this._commands;
	}
}