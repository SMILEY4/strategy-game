import {RenderGraphNodeCompiler} from "./renderGraphNodeCompiler";
import {RenderGraphCommand} from "./commands/renderGraphCommand";
import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";

export class RenderGraphCompiler {

	private readonly compilers: RenderGraphNodeCompiler<any>[];

	constructor(compilers: RenderGraphNodeCompiler<any>[]) {
		this.compilers = compilers;
	}

	public compile(nodes: RenderGraphNode<any>[], isInlineStep: boolean): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		for (let node of nodes) {

			const compiler = this.findCompiler(node, isInlineStep);
			if (compiler) {
				const context = new RenderGraphCompileContext(this, nodes, commands)
				commands.push(...compiler.compile(node, context));
			}

		}

		return commands;
	}

	private findCompiler(node: RenderGraphNode<any>, isInlineStep: boolean): RenderGraphNodeCompiler<any> | undefined {
		return this.compilers
			.filter(it => isInlineStep ? it.isInlineCompile() : true)
			.find(it => it.appliesTo(node))
	}


}