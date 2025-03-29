import {RenderGraphNode} from "../nodes/renderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderGraphNodeCompiler} from "./renderGraphNodeCompiler";

export class RenderGraphCompiler {

	private readonly nodeCompilers: RenderGraphNodeCompiler[] = [];

	constructor(nodeCompilers: RenderGraphNodeCompiler[]) {
		this.nodeCompilers = nodeCompilers;
	}

	validate(nodes: RenderGraphNode[]): string[] {
		const errors: string[] = [];
		for (let node of nodes) {
			const compiler = this.getNodeCompiler(node);
			errors.push(...compiler.validate(node));
		}
		return errors;
	}

	compile(nodes: RenderGraphNode[]): RenderGraphCommand[] {
		const commands: RenderGraphCommand[] = [];
		for (let node of nodes) {
			const compiler = this.getNodeCompiler(node);
			commands.push(...compiler.compile(node, commands));
		}
		return commands;
	}

	private getNodeCompiler(node: RenderGraphNode): RenderGraphNodeCompiler {
		for (let compiler of this.nodeCompilers) {
			if (compiler.handles(node)) {
				return compiler;
			}
		}
		throw new Error("No compiler found for render graph node " + node);
	}

}