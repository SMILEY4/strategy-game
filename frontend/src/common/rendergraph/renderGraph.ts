import {RenderGraphNode} from "./renderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexBufferRenderGraphNode} from "./nodes/vertexBufferRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";

/**
 * Manages all nodes and processes. Entry point for rendering.
 */
export class RenderGraph {

	private readonly unprocessedNodes: RenderGraphNode<any>[] = [];
	private readonly sortedNodes: RenderGraphNode<any>[] = [];

	protected addNode(node: RenderGraphNode<any>) {
		this.unprocessedNodes.push(node);
	}

	public initialize() {
		this.sortedNodes.push(...new RenderGraphSorter().sort(this.unprocessedNodes));
	}

	public dispose() {
		this.unprocessedNodes.length = 0;
		this.sortedNodes.length = 0;
	}

	public printGraph(): string {
		let graphvizString = "";

		graphvizString += "digraph G {\n";

		graphvizString += "   node [style=filled];"

		this.unprocessedNodes.forEach(node => {
			graphvizString += "    \"" + node.getTags().join(",") + "\";\n";
		});

		graphvizString += "\n";

		this.unprocessedNodes.forEach(node => {
			const gvNodeTo = "\"" + node.getTags().join(",") + "\"";
			node.getInputs().forEach(input => {
				const gvNodeFrom = "\"" + input.getTags().join(",") + "\"";
				graphvizString += "    " + gvNodeFrom + " -> " + gvNodeTo + ";\n";
			});
		});

		graphvizString += "}\n";

		return graphvizString;
	}

	public createCanvas(): CanvasRenderGraphNode {
		const node = new CanvasRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public createRenderTarget(): RenderTargetRenderGraphNode {
		const node = new RenderTargetRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public createTexture(): TextureRenderGraphNode {
		const node = new TextureRenderGraphNode();
		this.addNode(node);
		return node;
	}


	public createVertexBuffer(): VertexBufferRenderGraphNode {
		const node = new VertexBufferRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public createVertexDescriptor(): VertexDescriptorRenderGraphNode {
		const node = new VertexDescriptorRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public createShader(): ShaderRenderGraphNode {
		const node = new ShaderRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public createVertexCreator(): VertexCreatorRenderGraphNode {
		const node = new VertexCreatorRenderGraphNode();
		this.addNode(node);
		return node;
	}

}