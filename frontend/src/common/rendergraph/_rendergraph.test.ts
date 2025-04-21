import {RenderGraph} from "./renderGraph";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {VertexBufferRenderGraphNode} from "./nodes/vertexBufferRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {buildMap} from "../utils";

describe("render graph", () => {

	test("playground", () => {

		const graph = new RenderGraph();
		buildGraph(graph);

		graph.initialize();
	});

});


function buildGraph(graph: RenderGraph): CanvasRenderGraphNode {

	const textureTile = graph
		.createTexture()
		.withName("tile-texture")
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
		.withName("creator-baseTileVertices");

	return graph
		.createVertexBuffer()
		.withName("buffer-baseTileVertices")
		.withInput(vertexCreator.useOutput("mesh"));
}

function buildTileInstances(graph: RenderGraph): {
	vertexBufferWaterInstances: VertexBufferRenderGraphNode,
	vertexBufferLandInstances: VertexBufferRenderGraphNode
} {

	const vertexCreator = graph
		.createVertexCreator()
		.withName("creator-tileInstances");

	const vertexBufferWaterInstances = graph
		.createVertexBuffer()
		.withName("buffer-waterInstances")
		.withInput(vertexCreator.useOutput("water"));

	const vertexBufferLandInstances = graph
		.createVertexBuffer()
		.withName("buffer-landInstances")
		.withInput(vertexCreator.useOutput("land"));

	return {
		vertexBufferWaterInstances: vertexBufferWaterInstances,
		vertexBufferLandInstances: vertexBufferLandInstances,
	};
}


function buildWater(graph: RenderGraph, texture: TextureRenderGraphNode, vertexBufferBaseMesh: VertexBufferRenderGraphNode, vertexBufferInstances: VertexBufferRenderGraphNode): RenderTargetRenderGraphNode {

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withName("descriptor-waterMesh")
		.withInput(vertexBufferBaseMesh)
		.withInput(vertexBufferInstances);

	const shader = graph
		.createShader()
		.withName("shader-water")
		.withVertexShaderSource("...")
		.withFragmentShaderSource("...")
		.withInput(texture, "u_texture")

	const drawCall = graph
		.createDraw()
		.withName("draw-water")
		.withInput(vertexDescriptor)
		.withInput(shader)

	return graph
		.createRenderTarget()
		.withName("renderTarget-water")
		.withInput(drawCall);
}

function buildLand(graph: RenderGraph, texture: TextureRenderGraphNode, vertexBufferBaseMesh: VertexBufferRenderGraphNode, vertexBufferInstances: VertexBufferRenderGraphNode): RenderTargetRenderGraphNode {

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withName("descriptor-landMesh")
		.withInput(vertexBufferBaseMesh)
		.withInput(vertexBufferInstances);

	const shader = graph
		.createShader()
		.withName("shader-land")
		.withVertexShaderSource("...")
		.withFragmentShaderSource("...")
		.withInput(texture, "u_texture")

	const drawCall = graph
		.createDraw()
		.withName("draw-land")
		.withInput(vertexDescriptor)
		.withInput(shader)

	return graph
		.createRenderTarget()
		.withName("renderTarget-land")
		.withInput(drawCall);
}

function buildCombine(graph: RenderGraph, renderTargetWater: RenderTargetRenderGraphNode, renderTargetLand: RenderTargetRenderGraphNode): CanvasRenderGraphNode {

	const vertexCreator = graph
		.createVertexCreator()
		.withOutput("fullscreenQuad", [])
		.withFunction(() => {
			return buildMap({
				"fullscreenQuad": {
					data: new ArrayBuffer(0),
					entryCount: 4,
				}
			})
		})
		.withName("creator-fullscreenQuad");

	const vertexBuffer = graph
		.createVertexBuffer()
		.withName("buffer-fullscreenQuad")
		.withInput(vertexCreator.useOutput("fullscreenQuad"));

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withName("descriptor-fullscreenQuad")
		.withInput(vertexBuffer)

	const shader = graph
		.createShader()
		.withName("shader-combine")
		.withVertexShaderSource("...")
		.withFragmentShaderSource("...")
		.withInput(renderTargetWater, "u_layerWater")
		.withInput(renderTargetLand, "u_layerLand")

	const drawCall = graph
		.createDraw()
		.withName("draw-combine")
		.withInput(vertexDescriptor)
		.withInput(shader)

	return graph
		.createCanvas()
		.withName("canvas")
		.withInput(drawCall)
}