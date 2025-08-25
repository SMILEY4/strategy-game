import {RenderGraphNode} from "./renderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexGeneratorRenderGraphNode} from "./nodes/vertexGeneratorRenderGraphNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {DrawRenderGraphNode} from "./nodes/drawRenderGraphNode";
import {InitRenderGraphNode} from "./nodes/initRenderGraphNode";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";
import {RenderGraphCommand} from "./renderGraphCommand";
import {RenderElementGeneratorRenderGraphNode} from "./nodes/renderElementGeneratorRenderGraphNode";
import {ContainerRenderGraphNode} from "./nodes/containerRenderGraphNode";
import {HtmlDrawRenderGraphNode} from "./nodes/htmlDrawRenderGraphNode";
import {
	ConstPropertyRenderGraphNode,
	DerivedPropertyRenderGraphNode,
	DynamicPropertyRenderGraphNode,
	GeneratedPropertyRenderGraphNode,
} from "./nodes/propertyRenderGraphNode";
import {ConditionalTextureRenderGraphNode} from "./nodes/conditionalTextureRenderGraphNode";
import {IntermediateDataGeneratorRenderGraphNode} from "./nodes/intermediateDataGeneratorRenderGraphNode";
import {RenderGraphMonitor} from "./renderGraphMonitor";

/**
 * Manages all nodes and processes. Entry point for rendering.
 */
export class RenderGraph {

	private readonly unprocessedNodes: RenderGraphNode[] = [];
	private readonly sortedNodes: RenderGraphNode[] = [];
	private readonly commands: RenderGraphCommand[] = [];

	private readonly sorter: RenderGraphSorter;
	private readonly compiler: RenderGraphCompiler;
	private readonly resourceManager: RenderGraphResourceManager;

	private executeCounter: number = 0;

	constructor(sorter: RenderGraphSorter, resourceManager: RenderGraphResourceManager, compiler: RenderGraphCompiler) {
		this.sorter = sorter;
		this.resourceManager = resourceManager;
		this.compiler = compiler;
	}

	public initialize(compileResources: Map<string, any>) {
		this.validate();
		this.sort();
		this.createResources();
		this.compile(compileResources)
		this.executeCounter = 0;
	}

	private validate() {
		if (this.unprocessedNodes.map(it => it.getName()).distinct().length !== this.unprocessedNodes.length) {
			const nameCounts = new Map<string, number>();
			this.unprocessedNodes.forEach(node => {
				if(nameCounts.has(node.getName())) {
					nameCounts.set(node.getName(), nameCounts.get(node.getName())! + 1)
				} else {
					nameCounts.set(node.getName(), 1)
				}
			})
			const duplicateNames: string[] = [];
			for (let [name, count] of nameCounts) {
				if(count > 1) {
					duplicateNames.push(name);
				}
			}
			throw new Error("Names of render graph nodes are not unique! (" + duplicateNames + ")");
		}
		const errors = this.unprocessedNodes.flatMap(
			node => node.validate().map(error => "[" + node.getName() + "]" + error),
		);
		if (errors.length > 0) {
			throw new Error("Render graph validation error:\n" + errors.join("\n"));
		}
	}

	private sort()  {
		this.sortedNodes.push(
			new InitRenderGraphNode(),
			...this.sorter.sort(this.unprocessedNodes),
		);
	}

	private createResources() {
		this.resourceManager.initialize(this.sortedNodes);
	}

	private compile(compileResources: Map<string, any>) {
		this.commands.push(...this.compiler.compile(this.sortedNodes, compileResources, true, this.resourceManager));
		console.debug("Render Commands", this.commands.map(it => it.getDebugData()));
	}

	public dispose() {
		this.unprocessedNodes.length = 0;
		this.sortedNodes.length = 0;
		this.commands.length = 0;
		this.resourceManager.dispose();
	}

	public execute() {
		// RenderGraphMonitor.startFrame()
		for (let i = 0, n = this.commands.length; i < n; i++) {
			const command = this.commands[i];
			// RenderGraphMonitor.startCommand(command.getDebugData())
			// command.execute(this.resourceManager, this.executeCounter < 10);
			command.execute(this.resourceManager, true);
			// RenderGraphMonitor.endCommand()
		}
		this.executeCounter++;
		// RenderGraphMonitor.endFrame()
	}

	protected addNode(node: RenderGraphNode) {
		this.unprocessedNodes.push(node);
	}

	public createCanvas(name?: string): CanvasRenderGraphNode {
		const node = new CanvasRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createRenderTarget(name?: string): RenderTargetRenderGraphNode {
		const node = new RenderTargetRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createTexture(name?: string): TextureRenderGraphNode {
		const node = new TextureRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createConditionalTexture(name?: string): ConditionalTextureRenderGraphNode {
		const node = new ConditionalTextureRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createVertexDescriptor(name?: string): VertexDescriptorRenderGraphNode {
		const node = new VertexDescriptorRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createShader(name?: string): ShaderRenderGraphNode {
		const node = new ShaderRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createVertexCreator(name?: string): VertexGeneratorRenderGraphNode {
		const node = new VertexGeneratorRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createRenderElementGenerator(name?: string): RenderElementGeneratorRenderGraphNode {
		const node = new RenderElementGeneratorRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createIntermediateDataGenerator(name?: string): IntermediateDataGeneratorRenderGraphNode {
		const node = new IntermediateDataGeneratorRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createHtmlRender(name?: string): HtmlDrawRenderGraphNode {
		const node = new HtmlDrawRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createDraw(name?: string): DrawRenderGraphNode {
		const node = new DrawRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createPropertyDynamic<T>(name?: string): DynamicPropertyRenderGraphNode<T> {
		const node = new DynamicPropertyRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createPropertyConstant<T>(name?: string): ConstPropertyRenderGraphNode<T> {
		const node = new ConstPropertyRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createPropertyDerived<T>(name?: string): DerivedPropertyRenderGraphNode<T> {
		const node = new DerivedPropertyRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createPropertyGenerated<T>(name?: string): GeneratedPropertyRenderGraphNode<T> {
		const node = new GeneratedPropertyRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createContainer(name?: string): ContainerRenderGraphNode {
		const node = new ContainerRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

}