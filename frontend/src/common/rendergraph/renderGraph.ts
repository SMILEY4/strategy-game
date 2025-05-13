import {RenderGraphNode} from "./renderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {DrawRenderGraphNode} from "./nodes/drawRenderGraphNode";
import {InitRenderGraphNode} from "./nodes/initRenderGraphNode";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";
import {RenderGraphCommand} from "./renderGraphCommand";
import {ElementCreatorRenderGraphNode} from "./nodes/elementCreatorRenderGraphNode";
import {ContainerRenderGraphNode} from "./nodes/containerRenderGraphNode";
import {HtmlDrawRenderGraphNode} from "./nodes/htmlDrawRenderGraphNode";
import {
	ConstPropertyRenderGraphNode,
	DerivedPropertyRenderGraphNode,
	DynamicPropertyRenderGraphNode,
} from "./nodes/propertyRenderGraphNode";
import {ConditionalTextureRenderGraphNode} from "./nodes/conditionalTextureRenderGraphNode";

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

	constructor(sorter: RenderGraphSorter, compiler: RenderGraphCompiler, resourceManager: RenderGraphResourceManager) {
		this.sorter = sorter;
		this.compiler = compiler;
		this.resourceManager = resourceManager;
	}

	public initialize(compileResources: Map<string, any>) {

		if (this.unprocessedNodes.map(it => it.getName()).distinct().length !== this.unprocessedNodes.length) {
			throw new Error("Names of render graph nodes are not unique!");
		}

		const errors = this.unprocessedNodes.flatMap(
			node => node.validate().map(error => "[" + node.getName() + "]" + error),
		);
		if (errors.length > 0) {
			throw new Error("Render graph validation error:\n" + errors.join("\n"));
		}

		this.unprocessedNodes.push(new InitRenderGraphNode().withInputs(this.unprocessedNodes));

		this.sortedNodes.push(
			...this.sorter.sort(this.unprocessedNodes),
		);

		this.resourceManager.initialize(this.sortedNodes);

		this.commands.push(...this.compiler.compile(this.sortedNodes, compileResources, true));

		console.log(this.commands.map(it => it.getDebugData()))

		this.executeCounter = 0;
	}

	public dispose() {
		this.unprocessedNodes.length = 0;
		this.sortedNodes.length = 0;
		this.commands.length = 0;
		this.resourceManager.dispose();
	}

	public execute() {
		for (let i = 0, n = this.commands.length; i < n; i++) {
			this.commands[i].execute(this.resourceManager, this.executeCounter < 10);
		}
		this.executeCounter++;
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

	public createVertexCreator(name?: string): VertexCreatorRenderGraphNode {
		const node = new VertexCreatorRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createElementCreator(name?: string): ElementCreatorRenderGraphNode {
		const node = new ElementCreatorRenderGraphNode();
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

	public createContainer(name?: string): ContainerRenderGraphNode {
		const node = new ContainerRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

}