import {RenderGraphNodeCompiler} from "./renderGraphNodeCompiler";
import {RenderGraphCompileContext} from "./renderGraphCompileContext";
import {RenderGraphNode} from "./renderGraphNode";
import {RenderGraphCommand} from "./renderGraphCommand";

export class RenderGraphCompiler {

	private readonly compilers: RenderGraphNodeCompiler<any>[];

	constructor(compilers: RenderGraphNodeCompiler<any>[]) {
		this.compilers = compilers;
	}

	public compile(nodes: RenderGraphNode<any>[], compileResources: Map<string, any>, isInlineStep: boolean): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];

		for (let node of nodes) {

			const compiler = this.findCompiler(node, isInlineStep);
			if (compiler) {
				const context = new RenderGraphCompileContext(this, nodes, commands, compileResources)
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