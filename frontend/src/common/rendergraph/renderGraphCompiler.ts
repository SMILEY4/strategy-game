import {RenderGraphNodeCompiler} from "./renderGraphNodeCompiler";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";

export class RenderGraphCompiler {

	private readonly compilers: RenderGraphNodeCompiler<any>[];

	constructor(compilers: RenderGraphNodeCompiler<any>[]) {
		this.compilers = compilers;
	}

	public compile(nodes: RenderGraphNode<any>[]): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		for (let node of nodes) {

			const compiler = this.compilers.find(it => it.appliesTo(node));
			if (compiler) {
				const context = new RenderGraphCompileContext(nodes, commands)
				commands.push(...compiler.compile(node, context));
			} else {
				console.error("No compiler found for node '" + node.getTags().join(",") + "'")
			}

		}

		return commands;
	}


}