import {RenderGraph} from "./renderGraph";
import {TextureRenderGraphNode} from "./nodes/textureRenderGraphNode";
import {RenderTargetRenderGraphNode} from "./nodes/renderTargetRenderGraphNode";
import {CanvasRenderGraphNode} from "./nodes/canvasRenderGraphNode";
import {buildMap} from "../utils";
import {VertexCreatorRenderGraphNode} from "./nodes/vertexCreatorRenderGraphNode";
import {Tile} from "../../models/tile/tile";
import {GameStateAccess} from "../../state/gameStateAccess";
import {Settlement} from "../../models/settlement/settlement";

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


function buildTileBaseMesh(graph: RenderGraph): VertexCreatorRenderGraphNode.Output {

	const vertexCreator = graph
		.createVertexCreator()
		.withName("creator-baseTileVertices")
		.withFunction(context => buildMap({
			"mesh": {
				data: new ArrayBuffer(0),
				entryCount: 0,
			},
		}))
		.withOutput("mesh", "vertices", []);

	return vertexCreator.useOutput("mesh");
}

function buildTileInstances(graph: RenderGraph): {
	vertexBufferWaterInstances: VertexCreatorRenderGraphNode.Output,
	vertexBufferLandInstances: VertexCreatorRenderGraphNode.Output
} {
	const gameStateAccess: GameStateAccess = null as any;

	const propertyTiles = graph
		.createProperty<Tile[]>()
		.withTrackedChange("currentTurn")
		.withProvider(() => gameStateAccess.getTiles())
		.withName("tiles")

	const propertySettlements = graph
		.createProperty<Settlement[]>()
		.withTrackedChange("currentTurn")
		.withTrackedChange("commandRevId")
		.withProvider(() => gameStateAccess.getSettlements())
		.withName("tiles")

	const vertexCreator = graph
		.createVertexCreator()
		.withName("creator-tileInstances")
		.withProperty(propertyTiles)
		.withProperty(propertySettlements)
		.withFunction(context => {
			const tiles = context.get<Tile[]>("tiles")
			const settlements = context.get<Settlement[]>("settlements")
			//  build instances ...
			return buildMap({
				"water": {
					data: new ArrayBuffer(0),
					entryCount: 0,
				},
				"land": {
					data: new ArrayBuffer(0),
					entryCount: 0,
				},
			});
		})
		.withOutput("water", "instances", [/*...*/])
		.withOutput("land", "instances", [/*...*/]);

	return {
		vertexBufferWaterInstances: vertexCreator.useOutput("water"),
		vertexBufferLandInstances: vertexCreator.useOutput("land"),
	};
}


function buildWater(graph: RenderGraph, texture: TextureRenderGraphNode, vertexBufferBaseMesh: VertexCreatorRenderGraphNode.Output, vertexBufferInstances: VertexCreatorRenderGraphNode.Output): RenderTargetRenderGraphNode {

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
		.withProperty(texture, "u_texture");

	const drawCall = graph
		.createDraw()
		.withName("draw-water")
		.withShaderProgram(shader)
		.withVertexDescriptor(vertexDescriptor)

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
		.withProperty(texture, "u_texture");

	const drawCall = graph
		.createDraw()
		.withName("draw-land")
		.withInput(vertexDescriptor)
		.withInput(shader);

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
				},
			});
		})
		.withName("creator-fullscreenQuad");

	const vertexBuffer = graph
		.createVertexBuffer()
		.withName("buffer-fullscreenQuad")
		.withInput(vertexCreator.useOutput("fullscreenQuad"));

	const vertexDescriptor = graph
		.createVertexDescriptor()
		.withName("descriptor-fullscreenQuad")
		.withInput(vertexBuffer);

	const shader = graph
		.createShader()
		.withName("shader-combine")
		.withVertexShaderSource("...")
		.withFragmentShaderSource("...")
		.withProperty(renderTargetWater, "u_layerWater")
		.withProperty(renderTargetLand, "u_layerLand");

	const drawCall = graph
		.createDraw()
		.withName("draw-combine")
		.withInput(vertexDescriptor)
		.withInput(shader);

	return graph
		.createCanvas()
		.withName("canvas")
		.withInput(drawCall);
}