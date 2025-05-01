import {RenderGraph} from "../../common/rendergraph/renderGraph";
import {GLAttributeType, GLUniformType} from "../../common/webgl/glTypes";
import {TileMeshVertexCreator} from "./creators/tileMeshVertexCreator";
import {TileInstanceVertexCreator} from "./creators/tileInstancesVertexCreator";
import {Tile} from "../../models/tile/tile";
import {GameStateAccess} from "../../state/gameStateAccess";
import {OverlayMeshVertexCreator} from "./creators/overlayMeshVertexCreator";
import {MapMode} from "../../models/misc/mapMode";
import {OverlayInstancesVertexCreator} from "./creators/overlayInstancesVertexCreator";
import {MapDetailsVertexCreator} from "./creators/mapDetailsVertexCreator";
import {Settlement} from "../../models/settlement/settlement";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Route} from "../../models/route/route";
import {TextureAtlas, TextureAtlasEntry} from "../../common/webgl/textureAtlas";
import {RenderGraphSorter} from "../../common/rendergraph/renderGraphSorter";
import {RenderGraphCompiler} from "../../common/rendergraph/renderGraphCompiler";
import {VertexCreatorNodeCompiler} from "../../common/rendergraph/compilers/vertexCreatorNodeCompiler";
import {WebglShaderNodeCompiler} from "../../common/rendergraph/compilers/webglShaderNodeCompiler";
import {WebglDrawNodeCompiler} from "../../common/rendergraph/compilers/webglDrawNodeCompiler";
import {RenderGraphResourceManager} from "../../common/rendergraph/renderGraphResourceManager";
import {buildMap} from "../../common/utils";
import {RenderGraphKeys} from "../../common/rendergraph/renderGraphKeys";
import {TextureUnitHandler} from "../../common/rendergraph/compilers/textureUnitHandler";
import {GameChangeTracker} from "./gameChangeTracker";
import {GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap} from "../../common/webgl/glTexture";
import {Camera} from "../../common/webgl/camera";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {FullscreenQuadVertexCreator} from "./creators/fullscreenQuadVertexCreator";
import {WebGlContextResourceCreator} from "../../common/rendergraph/resources/webGlContextResourceCreator";
import {FramebufferResourceCreator} from "../../common/rendergraph/resources/framebufferResourceCreator";
import {TextureResourceCreator} from "../../common/rendergraph/resources/textureResourceCreator";
import {ShaderProgramResourceCreator} from "../../common/rendergraph/resources/shaderProgramResourceCreator";
import {VertexArrayResourceCreator} from "../../common/rendergraph/resources/vertexArrayResourceCreator";
import {VertexBufferResourceCreator} from "../../common/rendergraph/resources/vertexBufferResourceCreator";
import {VertexInfoResourceCreator} from "../../common/rendergraph/resources/vertexInfoResourceCreator";
import {TileSummary} from "../../models/tile/tileSummary";
import {mat3} from "../../common/webgl/mat3";
import {LabelsElementCreator} from "./creators/labelsElementCreator";
import {ElementCreatorNodeCompiler} from "../../common/rendergraph/compilers/elementCreatorNodeCompiler";
import {HtmlDrawNodeCompiler} from "../../common/rendergraph/compilers/htmlDrawNodeCompiler";
import {ElementDataResourceCreator} from "../../common/rendergraph/resources/elementDataResourceCreator";
import {HtmlElementPoolResourceCreator} from "../../common/rendergraph/resources/htmlElementPoolResourceCreator";
import {CachedHtmlElementResourceCreator} from "../../common/rendergraph/resources/cachedHtmlElementResourceCreator";

export class GameRenderGraphFactory {

	public initialize(renderGraph: RenderGraph): void {
		renderGraph.initialize(buildMap<any>([
			[
				RenderGraphKeys.textureUnitHandler(),
				new TextureUnitHandler(16),
			],
		]));
	}

	public create(
		gameAccess: GameStateAccess,
		changeTracker: GameChangeTracker,
		canvasHandle: CanvasHandle,
		shaderSourceManager: GameShaderSourceManager,
		textureAtlasManager: GameTextureAtlasDataManager,
	): RenderGraph {

		const gl = canvasHandle.getGL();

		const graph = new RenderGraph(
			new RenderGraphSorter(),
			new RenderGraphCompiler([
				new VertexCreatorNodeCompiler(),
				new WebglShaderNodeCompiler(),
				new WebglDrawNodeCompiler(),
				new ElementCreatorNodeCompiler(),
				new HtmlDrawNodeCompiler(),
			]),
			new RenderGraphResourceManager([
				new WebGlContextResourceCreator(gl),
				new FramebufferResourceCreator(gl),
				new TextureResourceCreator(gl),
				new ShaderProgramResourceCreator(gl),
				new VertexArrayResourceCreator(gl),
				new VertexBufferResourceCreator(gl),
				new VertexInfoResourceCreator(),
				new ElementDataResourceCreator(),
				new HtmlElementPoolResourceCreator(),
				new CachedHtmlElementResourceCreator(),
			]),
		);

		const textureAtlasDetails = TextureAtlas.createFromData(
			textureAtlasManager.getEntries("tileset_details"),
			textureAtlasManager.getGroupDefinitions("tileset_details"),
		);

		const propColorLandLight = graph
			.createPropertyConstant<[number, number, number]>("colorLandLight")
			.withType(GLUniformType.VEC3)
			.withValue(this.hexToRgb("#949b64"));

		const propColorLandDark = graph
			.createPropertyConstant<[number, number, number]>("colorLandDark")
			.withType(GLUniformType.VEC3)
			.withValue(this.hexToRgb("#747e57"));

		const propColorWaterLight = graph
			.createPropertyConstant<[number, number, number]>("colorWaterLight")
			.withType(GLUniformType.VEC3)
			.withValue(this.hexToRgb("#a5c0c5"));

		const propColorWaterDark = graph
			.createPropertyConstant<[number, number, number]>("colorWaterDark")
			.withType(GLUniformType.VEC3)
			.withValue(this.hexToRgb("#7995ae"));

		const propWaterWaveDistortionStrength = graph
			.createPropertyConstant<number>("waterWaveDistortionStrength")
			.withType(GLUniformType.FLOAT)
			.withValue(0.225);

		const propWaterWaveDistortionScale = graph
			.createPropertyConstant<number>("waterWaveDistortionScale")
			.withType(GLUniformType.FLOAT)
			.withValue(0.05);

		const propWaterWaveSpeed = graph
			.createPropertyConstant<number>("waterWaveSpeed")
			.withType(GLUniformType.FLOAT)
			.withValue(1.15);

		const propWaterWaveSharpness = graph
			.createPropertyConstant<number>("waterWaveSharpness")
			.withType(GLUniformType.FLOAT)
			.withValue(1.5);


		const propLandCutoffThreshold = graph
			.createPropertyConstant<number>("landCutoffThreshold")
			.withType(GLUniformType.FLOAT)
			.withValue(0.5);

		const propLandOutlineSizeLight = graph
			.createPropertyConstant<number>("landOutlineSizeLight")
			.withType(GLUniformType.FLOAT)
			.withValue(0.003);

		const propLandOutlineSizeDark = graph
			.createPropertyConstant<number>("landOutlineSizeDark")
			.withType(GLUniformType.FLOAT)
			.withValue(0.002);


		const propFogColorUnknown = graph
			.createPropertyConstant<[number, number, number, number]>("fogColorUnknown")
			.withType(GLUniformType.VEC4)
			.withValue([0.149, 0.122, 0.082, 1]);

		const propFogColorDiscovered = graph
			.createPropertyConstant<[number, number, number, number]>("fogColorDiscovered")
			.withType(GLUniformType.VEC4)
			.withValue([0.149, 0.122, 0.082, 0.6]);


		const propPaperLargeScale = graph
			.createPropertyConstant<number>("paperLargeScale")
			.withType(GLUniformType.FLOAT)
			.withValue(0.002);

		const propPaperLargeStrength = graph
			.createPropertyConstant<number>("paperLargeStrength")
			.withType(GLUniformType.FLOAT)
			.withValue(0.25);

		const propPaperLargeContrast = graph
			.createPropertyConstant<number>("paperLargeContrast")
			.withType(GLUniformType.FLOAT)
			.withValue(2);

		const propPaperMediumScale = graph
			.createPropertyConstant<number>("paperMediumScale")
			.withType(GLUniformType.FLOAT)
			.withValue(0.002);

		const propPaperMediumStrength = graph
			.createPropertyConstant<number>("paperMediumStrength")
			.withType(GLUniformType.FLOAT)
			.withValue(0.3);

		const propPaperMediumContrast = graph
			.createPropertyConstant<number>("paperMediumContrast")
			.withType(GLUniformType.FLOAT)
			.withValue(1);


		const propPaperSmallScale = graph
			.createPropertyConstant<number>("paperSmallScale")
			.withType(GLUniformType.FLOAT)
			.withValue(0.005);

		const propPaperSmallStrength = graph
			.createPropertyConstant<number>("paperSmallStrength")
			.withType(GLUniformType.FLOAT)
			.withValue(0.2);

		const propPaperSmallContrast = graph
			.createPropertyConstant<number>("paperSmallContrast")
			.withType(GLUniformType.FLOAT)
			.withValue(2);


		const propPaperCloudsScale = graph
			.createPropertyConstant<number>("paperCloudsScale")
			.withType(GLUniformType.FLOAT)
			.withValue(0.003);

		const propPaperCloudsStrength = graph
			.createPropertyConstant<number>("paperCloudsStrength")
			.withType(GLUniformType.FLOAT)
			.withValue(0.2);

		const propPaperCloudsContrast = graph
			.createPropertyConstant<number>("paperCloudsContrast")
			.withType(GLUniformType.FLOAT)
			.withValue(1);

		const propLutSize = graph
			.createPropertyConstant<number>("lutSize")
			.withType(GLUniformType.FLOAT)
			.withValue(64);


		const propTiles = graph
			.createProperty<Tile[]>("tiles")
			.withChangeTest(() => changeTracker.getTrackedChanges().tiles || changeTracker.getTrackedChanges().commands)
			.withProvider(() => gameAccess.getTiles());

		const propTileByPosProvider = graph
			.createProperty<(q: number, r: number) => Tile | null>("tileByPosProvider")
			.withChangeTest(() => changeTracker.getTrackedChanges().tiles || changeTracker.getTrackedChanges().commands)
			.withProvider(() => ((q, r) => gameAccess.getTileAt(q, r)));

		const propSettlements = graph
			.createProperty<Settlement[]>("settlements")
			.withChangeTest(() => changeTracker.getTrackedChanges().settlements || changeTracker.getTrackedChanges().commands)
			.withProvider(() => gameAccess.getSettlements());

		const propWorldObjects = graph
			.createProperty<WorldObject[]>("worldObjects")
			.withChangeTest(() => changeTracker.getTrackedChanges().worldObjects || changeTracker.getTrackedChanges().commands)
			.withProvider(() => gameAccess.getWorldObjects());

		const propRoutes = graph
			.createProperty<Route[]>("routes")
			.withChangeTest(() => changeTracker.getTrackedChanges().routes || changeTracker.getTrackedChanges().commands)
			.withProvider(() => gameAccess.getRoutes());

		const propMapMode = graph
			.createProperty<MapMode>("mapMode")
			.withChangeTest(() => changeTracker.getTrackedChanges().mapMode)
			.withProvider(() => gameAccess.getMapMode());

		const propMoveTargets = graph
			.createProperty<TileSummary[]>("moveTargets")
			.withChangeTest(() => true) // todo: wrong change test
			.withProvider(() => gameAccess.getMoveTargets());


		const propSelectedTile = graph
			.createProperty<[number, number]>("selectedTile")
			.withProvider(() => gameAccess.getSelectedTile() ? [gameAccess.getSelectedTile()?.position.q, gameAccess.getSelectedTile()?.position.r] as [number, number] : [99999, 99999])
			.withChangeTest(() => changeTracker.getTrackedChanges().selectedTile)
			.withType(GLUniformType.INT_VEC2);

		const propCameraVPM = graph
			.createProperty<Float32Array>("camera-vpm")
			.withType(GLUniformType.MAT3)
			.withChangeTest(() => changeTracker.getTrackedChanges().camera)
			.withProvider(() => {
				const camera = Camera.create(
					gameAccess.getCamera(),
					canvasHandle.getCanvasWidth(),
					canvasHandle.getCanvasHeight(),
					canvasHandle.getClientWidth(),
					canvasHandle.getClientHeight(),
				);
				return camera.getViewProjectionMatrixOrThrow(true);
			});

		const propCameraInvVPM = graph
			.createProperty<Float32Array>("camera-inv-vpm")
			.withType(GLUniformType.MAT3)
			.withChangeTest(() => changeTracker.getTrackedChanges().camera)
			.withProvider(() => {
				const camera = Camera.create(
					gameAccess.getCamera(),
					canvasHandle.getCanvasWidth(),
					canvasHandle.getCanvasHeight(),
					canvasHandle.getClientWidth(),
					canvasHandle.getClientHeight(),
				);
				return mat3.inverse(camera.getViewProjectionMatrixOrThrow(true));
			});

		const propTime = graph
			.createProperty<number>("time")
			.withProvider(() => (Date.now() / 1000) % 10000)
			.withChangeTest(() => true)
			.withType(GLUniformType.FLOAT);

		const propTextureAtlasGroups = graph
			.createProperty<Map<string, TextureAtlasEntry[]>>("textureAtlasGroups")
			.withChangeTest(() => false)
			.withProvider(() => {
				return buildMap<TextureAtlasEntry[]>(
					textureAtlasDetails
						.getGroupNames()
						.map(it => [it, textureAtlasDetails.getGroup(it)] as [string, TextureAtlasEntry[]]),
				);
			});

		const textureGroundPlotch = graph
			.createTexture("ground-splotch")
			.withUrl("/textures/groundSplotches.png");

		const textureNoiseWatercolor = graph
			.createTexture("noise_watercolor")
			.withUrl("/textures/noise_watercolor.png");

		const textureTilesetColor = graph
			.createTexture("tileset_color")
			.withUrl("/tileset_color.png");

		const textureTilesetOutline = graph
			.createTexture("tileset_outline")
			.withUrl("/tileset_outline.png");

		const textureTilesetMask = graph
			.createTexture("tileset_mask")
			.withUrl("/tileset_mask.png");

		const textureParchment = graph
			.createTexture("parchment")
			.withUrl("/textures/seamless_parchment_texture.jpg");

		const textureConcrete = graph
			.createTexture("concrete")
			.withUrl("/textures/non_uniform_concret_wall.jpg");

		const texturePaper = graph
			.createTexture("paper")
			.withUrl("/textures/seamless_paper_texture.jpg");

		const textureClouds = graph
			.createTexture("clouds")
			.withUrl("/textures/noise_watercolor.png");

		const textureLutNormal = graph
			.createTexture("lut_normal")
			.withUrl("/lut/lut_64_corrected.png")
			.withConfig({
				filterMin: GLTextureMinFilter.NEAREST,
				filterMag: GLTextureMagFilter.NEAREST,
				wrap: GLTextureWrap.CLAMP_TO_EDGE,
			});

		const textureLutGrayscale = graph
			.createTexture("lut_grayscale")
			.withUrl("/lut/lut_64_grayscale.png")
			.withConfig({
				filterMin: GLTextureMinFilter.NEAREST,
				filterMag: GLTextureMagFilter.NEAREST,
				wrap: GLTextureWrap.CLAMP_TO_EDGE,
			});

		const textureLut = graph
			.createConditional("lut")
			.withOption(textureLutNormal, () => !gameAccess.getMapMode().renderData.grayscale)
			.withOption(textureLutGrayscale, () => gameAccess.getMapMode().renderData.grayscale);

		const vertexCreatorTileMesh = graph
			.createVertexCreator("tile-mesh")
			.withOutput(TileMeshVertexCreator.OUTPUT_ID, "vertices", [
				{
					name: "in_vertexPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_textureCoordinates",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_cornerData",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
				},
				{
					name: "in_directionData",
					type: GLAttributeType.INT,
					amountComponents: 1,
				},
			])
			.withFunction(TileMeshVertexCreator.func);

		const vertexCreatorTileInstances = graph
			.createVertexCreator("tile-instances")
			.withProperty(propColorLandLight)
			.withProperty(propColorLandDark)
			.withProperty(propTiles)
			.withProperty(propTileByPosProvider)
			.withOutput(TileInstanceVertexCreator.OUTPUT_LAND_ID, "instances", [
				{
					name: "in_worldPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
					divisor: 1,
				},
				{
					name: "in_color",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
					divisor: 1,
				},
			])
			.withOutput(TileInstanceVertexCreator.OUTPUT_WATER_ID, "instances", [
				{
					name: "in_worldPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
					divisor: 1,
				},
				{
					name: "in_depth",
					type: GLAttributeType.FLOAT,
					amountComponents: 1,
					divisor: 1,
				},
				{
					name: "in_borderMask",
					type: GLAttributeType.INT,
					amountComponents: 1,
					divisor: 1,
				},
			])
			.withOutput(TileInstanceVertexCreator.OUTPUT_FOG_ID, "instances", [
				{
					name: "in_worldPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
					divisor: 1,
				},
				{
					name: "in_visibility",
					type: GLAttributeType.INT,
					amountComponents: 1,
					divisor: 1,
				},
			])
			.withFunction(TileInstanceVertexCreator.func);

		// WATER =================================

		const vertexDescriptorWater = graph
			.createVertexDescriptor("water")
			.withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexCreator.OUTPUT_ID))
			.withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexCreator.OUTPUT_WATER_ID));

		const shaderWater = graph
			.createShader("shader-water")
			.withVertexShaderSource(shaderSourceManager.get("water.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("water.frag"))
			.withProperty(propCameraVPM, "u_viewProjection")
			.withProperty(textureGroundPlotch, "u_texture");

		const drawWater = graph
			.createDraw("draw-water")
			.withShaderProgram(shaderWater)
			.withVertexDescriptor(vertexDescriptorWater)
			.withClearColor([0, 0, 0, 0])
			.withBlendFunction(gl => gl.blendFuncSeparate(
				gl.SRC_ALPHA,
				gl.ONE_MINUS_SRC_ALPHA,
				gl.ONE,
				gl.ONE_MINUS_SRC_ALPHA));

		const renderTargetWater = graph
			.createRenderTarget("water")
			.withDepth(false)
			.withInput(drawWater);

		// LAND =================================

		const vertexDescriptorLand = graph
			.createVertexDescriptor("land")
			.withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexCreator.OUTPUT_ID))
			.withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexCreator.OUTPUT_LAND_ID));

		const shaderLand = graph
			.createShader("shader-land")
			.withVertexShaderSource(shaderSourceManager.get("land.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("land.frag"))
			.withProperty(propCameraVPM, "u_viewProjection")
			.withProperty(textureGroundPlotch, "u_texture");

		const drawLand = graph
			.createDraw("draw-land")
			.withShaderProgram(shaderLand)
			.withVertexDescriptor(vertexDescriptorLand)
			.withClearColor([0, 0, 0, 0]);

		const renderTargetLand = graph
			.createRenderTarget("land")
			.withDepth(false)
			.withInput(drawLand);

		// FOG =================================

		const vertexDescriptorFog = graph
			.createVertexDescriptor("fog")
			.withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexCreator.OUTPUT_ID))
			.withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexCreator.OUTPUT_FOG_ID));

		const shaderFog = graph
			.createShader("shader-fog")
			.withVertexShaderSource(shaderSourceManager.get("fog.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("fog.frag"))
			.withProperty(propCameraVPM, "u_viewProjection")
			.withProperty(textureGroundPlotch, "u_texture");

		const drawFog = graph
			.createDraw("draw-fog")
			.withShaderProgram(shaderFog)
			.withVertexDescriptor(vertexDescriptorFog)
			.withClearColor([0, 0, 0, 1]);

		const renderTargetFog = graph
			.createRenderTarget("fog")
			.withDepth(false)
			.withInput(drawFog);

		// OVERLAY =================================

		const vertexCreatorOverlayMesh = graph
			.createVertexCreator("overlay-mesh")
			.withOutput(OverlayMeshVertexCreator.OUTPUT_ID, "vertices", [
				{
					name: "in_vertexPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_textureCoordinates",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_cornerData",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
				},
				{
					name: "in_directionData",
					type: GLAttributeType.INT,
					amountComponents: 1,
				},
			])
			.withFunction(OverlayMeshVertexCreator.func);

		const vertexCreatorOverlayInstances = graph
			.createVertexCreator("overlay-instances")
			.withProperty(propTiles)
			.withProperty(propTileByPosProvider)
			.withProperty(propMapMode)
			.withProperty(propMoveTargets)
			.withOutput(OverlayInstancesVertexCreator.OUTPUT_ID, "instances", [
				{
					name: "in_worldPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
					divisor: 1,
				},
				{
					name: "in_tilePosition",
					type: GLAttributeType.INT,
					amountComponents: 2,
					divisor: 1,
				},
				{
					name: "in_borderMask",
					type: GLAttributeType.INT,
					amountComponents: 1,
					divisor: 1,
				},
				{
					name: "in_borderColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 4,
					divisor: 1,
				},
				{
					name: "in_fillColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 4,
					divisor: 1,
				},
				{
					name: "in_highlightBorderMask",
					type: GLAttributeType.INT,
					amountComponents: 1,
					divisor: 1,
				},
				{
					name: "in_highlightBorderColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 4,
					divisor: 1,
				},
				{
					name: "in_highlightFillColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 4,
					divisor: 1,
				},
			])
			.withFunction(OverlayInstancesVertexCreator.func);

		const vertexDescriptorOverlay = graph
			.createVertexDescriptor("overlay")
			.withInput(vertexCreatorOverlayMesh.useOutput(OverlayMeshVertexCreator.OUTPUT_ID))
			.withInput(vertexCreatorOverlayInstances.useOutput(OverlayInstancesVertexCreator.OUTPUT_ID));

		const propOverlayBorderThickness = graph
			.createPropertyConstant<number>("overlay.borderThickness")
			.withValue(0.15)
			.withType(GLUniformType.FLOAT);

		const propOverlayBorderOpacity = graph
			.createPropertyConstant<number>("overlay.borderOpacity")
			.withValue(1.0)
			.withType(GLUniformType.FLOAT);

		const propOverlayFillOpacity = graph
			.createPropertyConstant<number>("overlay.fillOpacity")
			.withValue(0.5)
			.withType(GLUniformType.FLOAT);

		const propOverlayTileSelectionThickness = graph
			.createPropertyConstant<number>("overlay.tileSelection.thickness")
			.withValue(0.1)
			.withType(GLUniformType.FLOAT);

		const propOverlayTileSelectionColor0 = graph
			.createPropertyConstant<[number, number, number, number]>("overlay.tileSelection.color0")
			.withValue([255 / 255, 215 / 255, 0 / 255, 1.0])
			.withType(GLUniformType.VEC4);

		const propOverlayTileSelectionColor1 = graph
			.createPropertyConstant<[number, number, number, number]>("overlay.tileSelection.color1")
			.withValue([1.0, 1.0, 1.0, 1.0])
			.withType(GLUniformType.VEC4);

		const shaderOverlay = graph
			.createShader("shader-overlay")
			.withVertexShaderSource(shaderSourceManager.get("overlay.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("overlay.frag"))
			.withProperty(propCameraVPM, "u_viewProjection")
			.withProperty(textureNoiseWatercolor, "u_noise")
			.withProperty(propTime, "u_time")
			.withProperty(propOverlayBorderThickness, "u_overlay.borderThickness")
			.withProperty(propOverlayBorderOpacity, "u_overlay.borderOpacity")
			.withProperty(propOverlayFillOpacity, "u_overlay.fillOpacity")
			.withProperty(propSelectedTile, "u_tileSelection.position")
			.withProperty(propOverlayTileSelectionThickness, "u_tileSelection.thickness")
			.withProperty(propOverlayTileSelectionColor0, "u_tileSelection.color0")
			.withProperty(propOverlayTileSelectionColor1, "u_tileSelection.color1");


		const drawOverlay = graph
			.createDraw("draw-overlay")
			.withShaderProgram(shaderOverlay)
			.withVertexDescriptor(vertexDescriptorOverlay)
			.withClearColor([0, 0, 0, 0]);

		const renderTargetOverlay = graph
			.createRenderTarget("overlay")
			.withDepth(false)
			.withInput(drawOverlay);

		// DETAILS =================================

		const vertexCreatorMapDetails = graph
			.createVertexCreator("mapdetails")
			.withOutput(MapDetailsVertexCreator.OUTPUT_ID, "vertices", [
				{
					name: "in_worldPosition",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
				},
				{
					name: "in_textureCoordinates",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_baseTileColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
				},
				{
					name: "in_countryColor",
					type: GLAttributeType.FLOAT,
					amountComponents: 3,
				},
			])
			.withFunction(MapDetailsVertexCreator.func)
			.withProperty(propTiles)
			.withProperty(propSettlements)
			.withProperty(propWorldObjects)
			.withProperty(propRoutes)
			.withProperty(propColorLandLight)
			.withProperty(propColorLandDark)
			.withProperty(propTextureAtlasGroups);


		const vertexDescriptorMapDetails = graph
			.createVertexDescriptor("mapDetails")
			.withInput(vertexCreatorMapDetails.useOutput(MapDetailsVertexCreator.OUTPUT_ID));


		const shaderMapDetails = graph
			.createShader("shader-mapDetails")
			.withVertexShaderSource(shaderSourceManager.get("mapdetails.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("mapdetails.frag"))
			.withProperty(propCameraVPM, "u_viewProjection")
			.withProperty(textureTilesetColor, "u_textureColor")
			.withProperty(textureTilesetOutline, "u_textureOutline")
			.withProperty(textureTilesetMask, "u_textureMask");


		const drawMapDetails = graph
			.createDraw("draw-mapDetails")
			.withShaderProgram(shaderMapDetails)
			.withVertexDescriptor(vertexDescriptorMapDetails)
			.withClearColor([0, 0, 0, 0])
			.withScaling(2);

		const renderTargetMapDetails = graph
			.createRenderTarget("mapDetails")
			.withDepth(true)
			.withInput(drawMapDetails);

		// COMBINE =================================

		const vertexCreatorCombine = graph
			.createVertexCreator("combine")
			.withOutput(FullscreenQuadVertexCreator.OUTPUT_ID, "vertices", [
				{
					name: "in_position",
					type: GLAttributeType.FLOAT,
					amountComponents: 2,
				},
			])
			.withFunction(FullscreenQuadVertexCreator.func);

		const vertexDescriptorCombine = graph
			.createVertexDescriptor("combine")
			.withInput(vertexCreatorCombine.useOutput(FullscreenQuadVertexCreator.OUTPUT_ID));


		const shaderCombine = graph
			.createShader("shader-combine")
			.withVertexShaderSource(shaderSourceManager.get("combine.vert"))
			.withFragmentShaderSource(shaderSourceManager.get("combine.frag"))

			.withProperty(propTime, "u_common.timestamp")
			.withProperty(textureNoiseWatercolor, "u_common.noise")
			.withProperty(propCameraInvVPM, "u_common.invViewProjection")

			.withProperty(renderTargetWater, "u_water.layer")
			.withProperty(propColorWaterLight, "u_water.colorLight")
			.withProperty(propColorWaterDark, "u_water.colorDark")
			.withProperty(propWaterWaveDistortionStrength, "u_water.waveDistortionStrength")
			.withProperty(propWaterWaveDistortionScale, "u_water.waveDistortionScale")
			.withProperty(propWaterWaveSpeed, "u_water.waveSpeed")
			.withProperty(propWaterWaveSharpness, "u_water.waveSharpnesss")

			.withProperty(renderTargetLand, "u_land.layer")
			.withProperty(propLandCutoffThreshold, "u_land.cutoff")
			.withProperty(propLandOutlineSizeLight, "u_land.outlineSizeLight")
			.withProperty(propLandOutlineSizeDark, "u_land.outlineSizeDark")

			.withProperty(renderTargetFog, "u_fog.layer")
			.withProperty(propFogColorUnknown, "u_fog.colorUnknown")
			.withProperty(propFogColorDiscovered, "u_fog.colorDiscovered")

			.withProperty(renderTargetMapDetails, "u_mapDetails.layer")

			.withProperty(renderTargetOverlay, "u_overlay.layer")

			.withProperty(textureParchment, "u_paper.large.texture")
			.withProperty(propPaperLargeScale, "u_paper.large.scale")
			.withProperty(propPaperLargeStrength, "u_paper.large.strength")
			.withProperty(propPaperLargeContrast, "u_paper.large.contrast")

			.withProperty(textureConcrete, "u_paper.medium.texture")
			.withProperty(propPaperMediumScale, "u_paper.medium.scale")
			.withProperty(propPaperMediumStrength, "u_paper.medium.strength")
			.withProperty(propPaperMediumContrast, "u_paper.medium.contrast")

			.withProperty(texturePaper, "u_paper.small.texture")
			.withProperty(propPaperSmallScale, "u_paper.small.scale")
			.withProperty(propPaperSmallStrength, "u_paper.small.strength")
			.withProperty(propPaperSmallContrast, "u_paper.small.contrast")

			.withProperty(textureClouds, "u_paper.clouds.texture")
			.withProperty(propPaperCloudsScale, "u_paper.clouds.scale")
			.withProperty(propPaperCloudsStrength, "u_paper.clouds.strength")
			.withProperty(propPaperCloudsContrast, "u_paper.clouds.contrast")

			.withProperty(textureLut, "u_lutColorCorrection")
			.withProperty(propLutSize, "u_lutSize");

		const drawCombine = graph
			.createDraw("draw-combine")
			.withShaderProgram(shaderCombine)
			.withVertexDescriptor(vertexDescriptorCombine)
			.withClearColor([0, 0, 0, 1])
			.withScaling(1);

		const creatorLabels = graph
			.createElementCreator("create-labels")
			.withProperty(propSettlements)
			.withProperty(propWorldObjects)
			.withFunction(LabelsElementCreator.funcCreate)
			.withOutput(LabelsElementCreator.OUTPUT_ID);

		const htmlRendererLabels = graph
			.createHtmlRender("html-labels")
			.withCullingRadius(2)
			.withTemplateFunc(LabelsElementCreator.funcTemplate)
			.withRenderFunc(LabelsElementCreator.funcRender)
			.withElements(creatorLabels.useOutput(LabelsElementCreator.OUTPUT_ID));

		graph
			.createCanvas("screen")
			.withInput(drawCombine);

		graph
			.createContainer("html-elements")
			.withElementId("todo") // todo
			.withInput(htmlRendererLabels);

		return graph;
	}

	private hexToRgb(hex: string): [number, number, number] {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16) / 255,
			parseInt(result[2], 16) / 255,
			parseInt(result[3], 16) / 255,
		] : [0, 0, 0];
	}

}