import {RenderGraphCompiler} from "./base/renderGraphCompiler";
import {RenderGraphSorter} from "../../renderer/common/graph/renderGraphSorter";
import {RenderGraphNodeCompiler} from "./base/renderGraphNodeCompiler";
import {RenderGraphNodeSorter} from "./base/renderGraphNodeSorter";
import {RenderGraphNode} from "./nodes/renderGraphNode";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderGraphResourceManager} from "./resources/renderGraphResourceManager";
import {ExternalChangeGenerator} from "./externalChangeGenerator";
import {RenderGraphResourceCollector} from "./resources/renderGraphResourceCollector";

export class RenderGraph {

	private readonly sorter: RenderGraphSorter;
	private readonly compiler: RenderGraphCompiler;
	private readonly externalChangeGenerator: ExternalChangeGenerator;
	private readonly resourceManager: RenderGraphResourceManager;


	private readonly unsortedNodes: RenderGraphNode[];
	private readonly commands: RenderGraphCommand[] = [];


	constructor(externalChangeGenerator: ExternalChangeGenerator, compiler: RenderGraphNodeCompiler[], nodes: RenderGraphNode[]) {
		this.sorter = new RenderGraphNodeSorter();
		this.compiler = new RenderGraphCompiler(compiler);
		this.resourceManager = new RenderGraphResourceManager();
		this.externalChangeGenerator = externalChangeGenerator;
		this.unsortedNodes = nodes;
	}

	public initialize() {
		// compile resources
		this.resourceManager.registerResources(new RenderGraphResourceCollector().collectDefinitions(this.unsortedNodes)) // todo
		// compile commands
		this.commands.length = 0;
		this.compiler.validate(this.unsortedNodes);
		const sortedNodes = this.sorter.sort(this.unsortedNodes);
		this.commands.push(...this.compiler.compile(sortedNodes));
	}

	public execute() {

		this.resourceManager.clearChanges();
		this.externalChangeGenerator.provideExternalChangeKeys()
			.forEach(changeKey => this.resourceManager.markChange(changeKey));

		for (let i = 0, n = this.commands.length; i < n; i++) {
			this.commands[i].execute(this.resourceManager);
		}
	}

	public dispose() {
		this.resourceManager.clearChanges();
		this.commands.length = 0;
	}

}