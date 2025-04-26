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
import {PropertyRenderGraphNode} from "./nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./nodes/propertyConstRenderGraphNode";
import {ConditionalRenderGraphNode} from "./nodes/conditionalRenderGraphNode";
import {Camera} from "../webgl/camera";

/**
 * Manages all nodes and processes. Entry point for rendering.
 */
export class RenderGraph {

	private readonly unprocessedNodes: RenderGraphNode<any>[] = [];
	private readonly sortedNodes: RenderGraphNode<any>[] = [];
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

	public updateCamera(camera: Camera) { // todo: temp workaround
		this.resourceManager.createResource("camera", camera, _ => undefined)
	}

	public initialize(compileResources: Map<string, any>) {
		this.sortedNodes.push(
			new InitRenderGraphNode(),
			...this.sorter.sort(this.unprocessedNodes),
		);
		this.resourceManager.initialize(this.sortedNodes);
		this.commands.push(...this.compiler.compile(this.sortedNodes, compileResources, true));
		this.executeCounter = 0;
		console.log(this.commands.map(it => it.getDebugData()))
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

	protected addNode(node: RenderGraphNode<any>) {
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

	public createDraw(name?: string): DrawRenderGraphNode {
		const node = new DrawRenderGraphNode();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createProperty<T>(name?: string): PropertyRenderGraphNode<T> {
		const node = new PropertyRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createPropertyConstant<T>(name?: string): PropertyConstRenderGraphNode<T> {
		const node = new PropertyConstRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public createConditional<T extends RenderGraphNode<any>>(name?: string): ConditionalRenderGraphNode<T> {
		const node = new ConditionalRenderGraphNode<T>();
		if (name) node.withName(name);
		this.addNode(node);
		return node;
	}

	public printGraph(includeProperties: boolean): string {

		function toNodeName(node: RenderGraphNode<any>): string {
			if (node instanceof CanvasRenderGraphNode) return "canvas:" + node.getName();
			if (node instanceof DrawRenderGraphNode) return "draw:" + node.getName();
			if (node instanceof InitRenderGraphNode) return "init:" + node.getName();
			if (node instanceof PropertyRenderGraphNode) return "prop:" + node.getName();
			if (node instanceof RenderTargetRenderGraphNode) return "rendertgt:" + node.getName();
			if (node instanceof ShaderRenderGraphNode) return "shader:" + node.getName();
			if (node instanceof TextureRenderGraphNode) return "texture:" + node.getName();
			if (node instanceof VertexCreatorRenderGraphNode) return "vertcreator:" + node.getName();
			if (node instanceof VertexDescriptorRenderGraphNode) return "vertdescr:" + node.getName();
			return node.getName();
		}

		let graphvizString = "";

		graphvizString += "digraph G {\n";

		graphvizString += "   node [style=filled];";

		this.unprocessedNodes
			.filter(it => includeProperties || !(it instanceof PropertyRenderGraphNode || it instanceof TextureRenderGraphNode))
			.forEach(node => {
				graphvizString += "    \"" + toNodeName(node) + "\";\n";
			});

		graphvizString += "\n";

		this.unprocessedNodes
			.filter(it => includeProperties || !(it instanceof PropertyRenderGraphNode || it instanceof TextureRenderGraphNode))
			.forEach(node => {
				const gvNodeTo = "\"" + toNodeName(node) + "\"";
				node.getInputs()
					.filter(it => includeProperties || !(it instanceof PropertyRenderGraphNode || it instanceof TextureRenderGraphNode))
					.forEach(input => {
						const gvNodeFrom = "\"" + toNodeName(input) + "\"";
						graphvizString += "    " + gvNodeFrom + " -> " + gvNodeTo + ";\n";
					});
			});

		graphvizString += "}\n";

		return graphvizString;
	}

}