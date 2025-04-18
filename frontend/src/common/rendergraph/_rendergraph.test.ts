import {RenderGraph} from "./renderGraph";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {VertexBufferRenderGraphNode} from "./nodes/vertexBufferRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";

describe("render graph", () => {

	test("playground", () => {

		const graph = new RenderGraph();
		buildGraph(graph);

		graph.initialize();

		console.log("CMDS", graph.getCommands().map(it => it.toDebugString()))

		console.log("NODES", graph.getNodes().map(it => it.getTags().join(",")))

		console.log("GRAPH", graph.printGraph())

	});

});


function buildGraph(graph: RenderGraph): CanvasRenderGraphNode {

	const textureTile = graph
		.createTexture()
		.withTag("tile-texture")
		.withUrl("/test.png");

	const vertexBufferBaseMesh = buildTileBaseMesh(graph);

	const {vertexBufferWaterInstances, vertexBufferLandInstances} = buildTileInstances(graph);

	const renderTargetWater = buildWater(graph, textureTile, vertexBufferBaseMesh, vertexBufferWaterInstances);

	const renderTargetLand = buildLand(graph, textureTile, vertexBufferBaseMesh, vertexBufferLandInstances);

	return buildCombine(graph, renderTargetWater, renderTargetLand);
}


function buildTileBaseMesh(graph: RenderGraph): VertexBufferRenderGraphNode {

	const vertexCreator = graph
		.createVertexCreator()
		.withTag("creator-baseTileVertices");

	return graph
		.createVertexBuffer()
		.withTag("buffer-baseTileVertices")
		.withInput(vertexCreator.createOutput("mesh"));
}

function buildTileInstances(graph: RenderGraph): {
	vertexBufferWaterInstances: VertexBufferRenderGraphNode,
	vertexBufferLandInstances: VertexBufferRenderGraphNode
} {

	const vertexCreator = graph
		.createVertexCreator()
		.withTag("creator-tileInstances");

	const vertexBufferWaterInstances = graph
		.createVertexBuffer()
		.withTag("buffer-waterInstances")
		.withInput(vertexCreator.createOutput("water"));

	const vertexBufferLandInstances = graph
		.createVertexBuffer()
		.withTag("buffer-landInstances")
		.withInput(vertexCreator.createOutput("land"));

	return {
		vertexBufferWaterInstances: vertexBufferWaterInstances,
		vertexBufferLandInstances: vertexBufferLandInstances,
	};
}


function buildWater(graph: RenderGraph, texture: TextureRenderGraphNode, vertexBufferBaseMesh: VertexBufferRenderGraphNode, vertexBufferInstances: VertexBufferRenderGraphNode): RenderTargetRenderGraphNode {

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withTag("descriptor-waterMesh")
		.withInput(vertexBufferBaseMesh)
		.withInput(vertexBufferInstances);

	const shader = graph
		.createShader()
		.withTag("shader-water")
		.withVertexShader("...")
		.withFragmentShader("...")
		.withInput(texture, "u_texture")
		.withInput(vertexDescriptor);

	return graph
		.createRenderTarget()
		.withTag("renderTarget-water")
		.withInput(shader);
}

function buildLand(graph: RenderGraph, texture: TextureRenderGraphNode, vertexBufferBaseMesh: VertexBufferRenderGraphNode, vertexBufferInstances: VertexBufferRenderGraphNode): RenderTargetRenderGraphNode {

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withTag("descriptor-landMesh")
		.withInput(vertexBufferBaseMesh)
		.withInput(vertexBufferInstances);

	const shader = graph
		.createShader()
		.withTag("shader-land")
		.withVertexShader("...")
		.withFragmentShader("...")
		.withInput(texture, "u_texture")
		.withInput(vertexDescriptor);

	return graph
		.createRenderTarget()
		.withTag("renderTarget-land")
		.withInput(shader);
}

function buildCombine(graph: RenderGraph, renderTargetWater: RenderTargetRenderGraphNode, renderTargetLand: RenderTargetRenderGraphNode): CanvasRenderGraphNode {

	const vertexCreator = graph
		.createVertexCreator()
		.withTag("creator-fullscreenQuad");

	const vertexBuffer = graph
		.createVertexBuffer()
		.withTag("buffer-fullscreenQuad")
		.withInput(vertexCreator.createOutput("fullscreenQuad"));

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withTag("descriptor-fullscreenQuad")
		.withInput(vertexBuffer)

	const shader = graph
		.createShader()
		.withTag("shader-combine")
		.withVertexShader("...")
		.withFragmentShader("...")
		.withInput(renderTargetWater, "u_layerWater")
		.withInput(renderTargetLand, "u_layerLand")
		.withInput(vertexDescriptor);

	return graph
		.createCanvas()
		.withTag("canvas")
		.withInput(shader)
}