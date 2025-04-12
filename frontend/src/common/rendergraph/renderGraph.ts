import {RenderGraphNode} from "./renderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexBufferRenderGraphNode} from "./nodes/vertexBufferRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {RenderGraphSorter} from "./renderGraphSorter";

export class RenderGraph {

	private readonly unprocessedNodes: RenderGraphNode[] = [];
	private readonly sortedNodes: RenderGraphNode[] = [];

	protected addNode(node: RenderGraphNode) {
		this.unprocessedNodes.push(node);
	}

	public initialize() {
		this.sortedNodes.push(...new RenderGraphSorter().sort(this.unprocessedNodes));
	}

	public dispose() {
		this.unprocessedNodes.length = 0;
		this.sortedNodes.length = 0;
	}





	public createCanvas(): CanvasRenderGraphNode {
		const node = new CanvasRenderGraphNode();
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