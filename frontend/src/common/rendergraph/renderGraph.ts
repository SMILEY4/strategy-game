import {RenderGraphNode} from "./renderGraphNode";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {ShaderRenderGraphNode} from "./nodes/shaderRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {VertexDescriptorRenderGraphNode} from "./nodes/vertexDescriptorRenderGraphNode";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {RenderGraphSorter} from "./renderGraphSorter";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {RenderGraphCompiler} from "./renderGraphCompiler";
import {VertexCreatorNodeCompiler} from "./compilers/vertexCreatorNodeCompiler";
import {WebglShaderNodeCompiler} from "./compilers/webglShaderNodeCompiler";
import {DrawRenderGraphNode} from "./nodes/drawRenderGraphNode";
import {WebglDrawNodeCompiler} from "./compilers/webglDrawNodeCompiler";
import {InitRenderGraphNode} from "./nodes/initRenderGraphNode";
import {RenderGraphResourceManager} from "./renderGraphResourceManager";
import {FramebufferResourceCreator} from "./resources/framebufferResourceCreator";
import {TextureResourceCreator} from "./resources/textureResourceCreator";
import {ShaderProgramResourceCreator} from "./resources/shaderProgramResourceCreator";
import {TextureUnitHandlerResourceCreator} from "./resources/textureUnitHandlerResourceCreator";
import {VertexArrayResourceCreator} from "./resources/vertexArrayResourceCreator";
import {VertexBufferResourceCreator} from "./resources/vertexBufferResourceCreator";
import {VertexInfoResourceCreator} from "./resources/vertexInfoResourceCreator";
import {WebGlContextResourceCreator} from "./resources/webGlContextResourceCreator";
import {RenderGraphCommand} from "./renderGraphCommand";

/**
 * Manages all nodes and processes. Entry point for rendering.
 */
export class RenderGraph {

	private readonly unprocessedNodes: RenderGraphNode<any>[] = [];
	private readonly sortedNodes: RenderGraphNode<any>[] = [];
	private readonly commands: RenderGraphCommand[] = [];
	private resourceManager: RenderGraphResourceManager = null as any;

	protected addNode(node: RenderGraphNode<any>) {
		this.unprocessedNodes.push(node);
	}

	public getNodes(): RenderGraphNode<any>[] {
		return this.sortedNodes;
	}

	public initialize(gl: WebGL2RenderingContext) {
		const sorter = new RenderGraphSorter();
		const compiler = new RenderGraphCompiler([
			new VertexCreatorNodeCompiler(),
			new WebglShaderNodeCompiler(),
			new WebglDrawNodeCompiler(),
		]);
		const resourceManager = new RenderGraphResourceManager([
			new WebGlContextResourceCreator(gl),
			new TextureUnitHandlerResourceCreator(gl),
			new FramebufferResourceCreator(gl),
			new TextureResourceCreator(gl),
			new ShaderProgramResourceCreator(gl),
			new VertexArrayResourceCreator(gl),
			new VertexBufferResourceCreator(gl),
			new VertexInfoResourceCreator(),
			// todo: camera(s)
		]);

		this.sortedNodes.push(
			new InitRenderGraphNode(),
			...sorter.sort(this.unprocessedNodes)
		);

		this.resourceManager.initialize(this.sortedNodes);

		this.commands.push(...compiler.compile(this.sortedNodes, true));

		this.resourceManager = resourceManager;
	}

	public dispose() {
		this.unprocessedNodes.length = 0;
		this.sortedNodes.length = 0;
		this.commands.length = 0;
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

	public createDraw(): DrawRenderGraphNode {
		const node = new DrawRenderGraphNode();
		this.addNode(node);
		return node;
	}

	public printGraph(): string {
		let graphvizString = "";

		graphvizString += "digraph G {\n";

		graphvizString += "   node [style=filled];";

		this.unprocessedNodes.forEach(node => {
			graphvizString += "    \"" + node.getName() + "\";\n";
		});

		graphvizString += "\n";

		this.unprocessedNodes.forEach(node => {
			const gvNodeTo = "\"" + node.getName() + "\"";
			node.getInputs().forEach(input => {
				const gvNodeFrom = "\"" + input.getName() + "\"";
				graphvizString += "    " + gvNodeFrom + " -> " + gvNodeTo + ";\n";
			});
		});

		graphvizString += "}\n";

		return graphvizString;
	}


}