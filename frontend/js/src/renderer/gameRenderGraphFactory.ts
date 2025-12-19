import {RenderGraph} from "../common/rendergraph/renderGraph";
import {GLAttributeType, GLUniformType} from "../common/webgl/glTypes";
import {TileMeshVertexGenerator} from "./generators/tileMeshVertexGenerator";
import {TileInstanceVertexGenerator} from "./generators/tileInstancesVertexCreator";
import {Tile} from "../models/tile/tile";
import {OverlayMeshVertexGenerator} from "./generators/overlayMeshVertexGenerator";
import {MapMode} from "../models/misc/mapMode";
import {OverlayInstancesVertexGenerator} from "./generators/overlayInstancesVertexGenerator";
import {MapDetailsVertexGenerator} from "./generators/mapDetailsVertexGenerator";
import {WorldObject} from "../models/worldobject/worldObject";
import {TextureAtlas, TextureAtlasEntry} from "../common/webgl/textureAtlas";
import {RenderGraphSorter} from "../common/rendergraph/renderGraphSorter";
import {RenderGraphCompiler} from "../common/rendergraph/renderGraphCompiler";
import {VertexGeneratorNodeCompiler} from "../common/rendergraph/compilers/vertexGeneratorNodeCompiler";
import {WebglShaderNodeCompiler} from "../common/rendergraph/compilers/webglShaderNodeCompiler";
import {WebglDrawNodeCompiler} from "../common/rendergraph/compilers/webglDrawNodeCompiler";
import {RenderGraphResourceManager} from "../common/rendergraph/renderGraphResourceManager";
import {buildMap, Rectangle} from "../common/utils";
import {RenderGraphKeys} from "../common/rendergraph/renderGraphKeys";
import {TextureUnitHandler} from "../common/rendergraph/compilers/textureUnitHandler";
import {GameChangeTracker} from "./gameChangeTracker";
import {GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap} from "../common/webgl/glTexture";
import {Camera} from "../common/webgl/camera";
import {CanvasHandle} from "../common/webgl/canvasHandle";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {FullscreenQuadVertexGenerator} from "./generators/fullscreenQuadVertexGenerator";
import {WebGLContextResourceCreator} from "../common/rendergraph/resources/webGLContextResourceCreator";
import {FramebufferResourceCreator} from "../common/rendergraph/resources/framebufferResourceCreator";
import {TextureResourceCreator} from "../common/rendergraph/resources/textureResourceCreator";
import {ShaderProgramResourceCreator} from "../common/rendergraph/resources/shaderProgramResourceCreator";
import {VertexArrayResourceCreator} from "../common/rendergraph/resources/vertexArrayResourceCreator";
import {VertexBufferResourceCreator} from "../common/rendergraph/resources/vertexBufferResourceCreator";
import {VertexInfoResourceCreator} from "../common/rendergraph/resources/vertexInfoResourceCreator";
import {TileSummary} from "../models/tile/tileSummary";
import {mat3} from "../common/webgl/mat3";
import {LabelsElementGenerator} from "./generators/labelsElementGenerator";
import {HtmlDrawNodeCompiler} from "../common/rendergraph/compilers/htmlDrawNodeCompiler";
import {HtmlElementPoolResourceCreator} from "../common/rendergraph/resources/htmlElementPoolResourceCreator";
import {CachedHtmlElementResourceCreator} from "../common/rendergraph/resources/cachedHtmlElementResourceCreator";
import {ResourceIconsElementGenerator} from "./generators/resourceIconsElementGenerator";
import {MovePathsElementGenerator} from "./generators/movePathsElementGenerator";
import {PropertyResourceCreator} from "../common/rendergraph/resources/propertyResourceCreator";
import {PropertyNodeCompiler} from "../common/rendergraph/compilers/propertyNodeCompiler";
import {DataGeneratorNodeCompiler} from "../common/rendergraph/compilers/dataGeneratorNodeCompiler";
import {
	RenderElementGeneratorRenderGraphNode,
} from "../common/rendergraph/nodes/renderElementGeneratorRenderGraphNode";
import {GeneratorDataResourceCreator} from "../common/rendergraph/resources/generatorDataResourceCreator";
import {
	IntermediateDataGeneratorRenderGraphNode,
} from "../common/rendergraph/nodes/intermediateDataGeneratorRenderGraphNode";
import {FrameIdResourceGenerator} from "../common/rendergraph/resources/frameIdResourceGenerator";
import {InitNodeCompiler} from "../common/rendergraph/compilers/initNodeCompiler";
import {RelevantWorldAreaGenerator} from "./generators/relevantWorldAreaGenerator";
import {WasmGameRenderer} from "./wasmGameRenderer";
import {Command} from "../models/command/command";
import {gameInteractionEngine} from "../app/game/game.interaction-engine";
import {
	WorldObjectMoveInteractionContext,
	worldObjectMoveInteractionDefinition,
} from "../app/game/worldobject/worldobject.interaction.move";
import {WorldObjectStateAccess} from "../app/game/worldobject/worldobject.state-access";
import {CameraStateAccess} from "../app/game/camera/camera.state-access";
import {MapStateAccess} from "../app/game/map/map.state-access";
import {TileStateAccess} from "../app/game/tile/tile.state.access";
import {CommandStateAccess} from "../app/game/command/command.state-access";
import {Route} from "../models/route/route";
import {RouteStateAccess} from "../app/game/route/route.state-access";

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
        changeTracker: GameChangeTracker,
        canvasHandle: CanvasHandle,
        shaderSourceManager: GameShaderSourceManager,
        textureAtlasManager: GameTextureAtlasDataManager,
        wasmGameRenderer: WasmGameRenderer,
    ): RenderGraph {

        const graph = this.configureBaseRenderGraph(canvasHandle.getGL());

        const configProps = this.createConfigurationProperties(graph);
        const textureNodes = this.createTextureNodes(graph);
        const commonProperties = this.createCommonProperties(graph, changeTracker, canvasHandle, wasmGameRenderer);

        // TEXTURE ATLAS =========================

        const textureAtlas = TextureAtlas.createFromData(
            textureAtlasManager.getEntries("tileset_details"),
            textureAtlasManager.getGroupDefinitions("tileset_details"),
        );

        const propTextureAtlas = graph
            .createPropertyDynamic<Map<string, TextureAtlasEntry[]>>("textureAtlasGroups")
            .withChangeTest(() => false)
            .withValue(() => {
                return buildMap<TextureAtlasEntry[]>(
                    textureAtlas
                        .getGroupNames()
                        .map(it => [it, textureAtlas.getGroup(it)] as [string, TextureAtlasEntry[]]),
                );
            });

        const propTextureAtlasWasm = graph
            .createPropertyWasm<Map<string, TextureAtlasEntry[]>>("textureAtlasGroups-wasm")
            .withValue(propTextureAtlas, it => wasmGameRenderer.setTextureAtlasEntries(it));

        // RELEVANT WORLD AREA ===================

        const relevantWorldAreaGenerator = graph
            .createIntermediateDataGenerator("gen-relevant-world-area")
            .withProperty(commonProperties.camera, "camera")
            .withFunction(RelevantWorldAreaGenerator.func)
            .withOutput(RelevantWorldAreaGenerator.OUTPUT_ID);

        const propRelevantWorldArea = graph
            .createPropertyGenerated<Rectangle>("prop-relevant-world-area")
            .withValue(relevantWorldAreaGenerator.useOutput(RelevantWorldAreaGenerator.OUTPUT_ID));

        const propRelevantWorldAreaWasm = graph
            .createPropertyWasm<Rectangle>("prop-relevant-world-area-wasm")
            .withValue(propRelevantWorldArea, it => wasmGameRenderer.setRelevantWorldArea(it));


        // TILE MAP BASICS =======================

        const vertexCreatorTileMesh = graph
            .createVertexCreator("gen-tile-mesh")
            .withOutput(TileMeshVertexGenerator.OUTPUT_ID, "vertices", [
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
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 1,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 3,
                },
            ])
            .withFunction(TileMeshVertexGenerator.func);

        const vertexCreatorTileInstances = graph
            .createVertexCreator("gen-tile-instances")
            .withProperty(commonProperties.tilesWasm)
            .withProperty(propRelevantWorldAreaWasm)
            .withOutput(TileInstanceVertexGenerator.OUTPUT_LAND_ID, "instances", [
                {
                    name: "in_worldPosition",
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                    divisor: 1,
                },
                {
                    name: "in_color",
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 3,
                    divisor: 1,
                    normalized: true,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 1,
                    divisor: 1,
                },
            ])
            .withOutput(TileInstanceVertexGenerator.OUTPUT_WATER_ID, "instances", [
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
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 1,
                    divisor: 1,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 3,
                    divisor: 1,
                },
            ])
            .withOutput(TileInstanceVertexGenerator.OUTPUT_FOG_ID, "instances", [
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
            .withFunction(ctx => TileInstanceVertexGenerator.funcWasm(ctx, wasmGameRenderer));

        // WATER =================================

        const vertexDescriptorWater = graph
            .createVertexDescriptor("vd-water")
            .withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexGenerator.OUTPUT_ID))
            .withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexGenerator.OUTPUT_WATER_ID));

        const shaderWater = graph
            .createShader("shader-water")
            .withVertexShaderSource(shaderSourceManager.get("water.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("water.frag"))
            .withProperty(commonProperties.cameraVPM, "u_viewProjection")
            .withProperty(textureNodes.groundSplotch, "u_texture");

        const drawWater = graph
            .createDraw("draw-water")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderWater)
            .withVertexDescriptor(vertexDescriptorWater)
            .withClearColor([0, 0, 0, 0])
            .withBlendFunction(gl => gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA));

        const renderTargetWater = graph
            .createRenderTarget("rt-water")
            .withDepth(false)
            .withInput(drawWater);

        // LAND =================================

        const vertexDescriptorLand = graph
            .createVertexDescriptor("vd-land")
            .withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexGenerator.OUTPUT_ID))
            .withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexGenerator.OUTPUT_LAND_ID));

        const shaderLand = graph
            .createShader("shader-land")
            .withVertexShaderSource(shaderSourceManager.get("land.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("land.frag"))
            .withProperty(commonProperties.cameraVPM, "u_viewProjection")
            .withProperty(textureNodes.groundSplotch, "u_texture");

        const drawLand = graph
            .createDraw("draw-land")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderLand)
            .withVertexDescriptor(vertexDescriptorLand)
            .withClearColor([0, 0, 0, 0]);

        const renderTargetLand = graph
            .createRenderTarget("rt-land")
            .withDepth(false)
            .withInput(drawLand);

        // FOG =================================

        const vertexDescriptorFog = graph
            .createVertexDescriptor("vd-fog")
            .withInput(vertexCreatorTileMesh.useOutput(TileMeshVertexGenerator.OUTPUT_ID))
            .withInput(vertexCreatorTileInstances.useOutput(TileInstanceVertexGenerator.OUTPUT_FOG_ID));

        const shaderFog = graph
            .createShader("shader-fog")
            .withVertexShaderSource(shaderSourceManager.get("fog.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("fog.frag"))
            .withProperty(commonProperties.cameraVPM, "u_viewProjection")
            .withProperty(textureNodes.groundSplotch, "u_texture");

        const drawFog = graph
            .createDraw("draw-fog")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderFog)
            .withVertexDescriptor(vertexDescriptorFog)
            .withClearColor([0, 0, 0, 1]);

        const renderTargetFog = graph
            .createRenderTarget("rt-fog")
            .withDepth(false)
            .withInput(drawFog);

        // OVERLAY =================================

        const vertexCreatorOverlayMesh = graph
            .createVertexCreator("gen-overlay-mesh")
            .withOutput(OverlayMeshVertexGenerator.OUTPUT_ID, "vertices", [
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
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 1,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 3,
                },
            ])
            .withFunction(OverlayMeshVertexGenerator.func);

        const vertexCreatorOverlayInstances = graph
            .createVertexCreator("gen-overlay-instances")
            .withProperty(commonProperties.tilesWasm)
            .withProperty(commonProperties.mapModeWasm)
            .withProperty(commonProperties.highlightedTilesWasm)
            .withProperty(propRelevantWorldAreaWasm)
            .withOutput(OverlayInstancesVertexGenerator.OUTPUT_ID, "instances", [
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
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 1,
                    divisor: 1,
                },
                {
                    name: "in_borderColor",
                    type: GLAttributeType.U_BYTE,
                    normalized: true,
                    amountComponents: 4,
                    divisor: 1,
                },
                {
                    name: "in_fillColor",
                    type: GLAttributeType.U_BYTE,
                    normalized: true,
                    amountComponents: 4,
                    divisor: 1,
                },
                {
                    name: "in_highlight",
                    type: GLAttributeType.U_BYTE,
                    amountComponents: 1,
                    divisor: 1,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 2,
                    divisor: 1,
                },
            ])
            .withFunction(ctx => OverlayInstancesVertexGenerator.funcWasm(ctx, wasmGameRenderer));

        const vertexDescriptorOverlay = graph
            .createVertexDescriptor("vd-overlay")
            .withInput(vertexCreatorOverlayMesh.useOutput(OverlayMeshVertexGenerator.OUTPUT_ID))
            .withInput(vertexCreatorOverlayInstances.useOutput(OverlayInstancesVertexGenerator.OUTPUT_ID));

        const shaderOverlay = graph
            .createShader("shader-overlay")
            .withVertexShaderSource(shaderSourceManager.get("overlay.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("overlay.frag"))
            .withProperty(commonProperties.cameraVPM, "u_viewProjection")
            .withProperty(textureNodes.noiseWatercolor, "u_noise")
            .withProperty(commonProperties.time, "u_time")
            .withProperty(configProps.overlayBorderThickness, "u_overlay.borderThickness")
            .withProperty(configProps.overlayBorderOpacity, "u_overlay.borderOpacity")
            .withProperty(configProps.overlayFillOpacity, "u_overlay.fillOpacity")
            .withProperty(commonProperties.selectedTile, "u_tileSelection.position")
            .withProperty(configProps.selectedTileThickness, "u_tileSelection.thickness")
            .withProperty(configProps.selectedTileColor0, "u_tileSelection.color0")
            .withProperty(configProps.selectedTileColor1, "u_tileSelection.color1")
            .withProperty(commonProperties.hoveredTile, "u_tileHovered")
            .withProperty(configProps.tileHighlightGap, "u_highlightData.gap")
            .withProperty(configProps.tileHighlightColorInnerDefault, "u_highlightData.colorInnerDefault")
            .withProperty(configProps.tileHighlightColorOuterDefault, "u_highlightData.colorOuterDefault")
            .withProperty(configProps.tileHighlightColorInnerHover, "u_highlightData.colorInnerHover")
            .withProperty(configProps.tileHighlightColorOuterHover, "u_highlightData.colorOuterHover")
            .withProperty(configProps.tileHighlightColorInnerActive, "u_highlightData.colorInnerActive")
            .withProperty(configProps.tileHighlightColorOuterActive, "u_highlightData.colorOuterActive");

        const drawOverlay = graph
            .createDraw("draw-overlay")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderOverlay)
            .withVertexDescriptor(vertexDescriptorOverlay)
            .withClearColor([0, 0, 0, 0]);

        const renderTargetOverlay = graph
            .createRenderTarget("rt-overlay")
            .withDepth(false)
            .withInput(drawOverlay);

        // DETAILS =================================

        const vertexCreatorMapDetails = graph
            .createVertexCreator("gen-mapdetails")
            .withProperty(propRelevantWorldAreaWasm)
            .withProperty(commonProperties.tilesWasm)
            .withProperty(commonProperties.worldObjectsWasm)
            .withProperty(commonProperties.routesWasm)
            .withProperty(propTextureAtlasWasm)
            .withOutput(MapDetailsVertexGenerator.OUTPUT_ID, "vertices", [
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
                    type: GLAttributeType.U_BYTE,
                    normalized: true,
                    amountComponents: 3,
                },
                {
                    name: "in_countryColor",
                    type: GLAttributeType.U_BYTE,
                    normalized: true,
                    amountComponents: 3,
                },
                {
                    name: "_padding",
                    type: GLAttributeType.PADDING,
                    amountComponents: 2,
                },
            ])
            .withFunction(ctx => MapDetailsVertexGenerator.funcWasm(ctx, wasmGameRenderer));


        const vertexDescriptorMapDetails = graph
            .createVertexDescriptor("vd-mapDetails")
            .withInput(vertexCreatorMapDetails.useOutput(MapDetailsVertexGenerator.OUTPUT_ID));


        const shaderMapDetails = graph
            .createShader("shader-mapDetails")
            .withVertexShaderSource(shaderSourceManager.get("mapdetails.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("mapdetails.frag"))
            .withProperty(commonProperties.cameraVPM, "u_viewProjection")
            .withProperty(textureNodes.tilesetColor, "u_textureColor")
            .withProperty(textureNodes.tilesetOutline, "u_textureOutline")
            .withProperty(textureNodes.tilesetMask, "u_textureMask");


        const drawMapDetails = graph
            .createDraw("draw-mapDetails")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderMapDetails)
            .withVertexDescriptor(vertexDescriptorMapDetails)
            .withClearColor([0, 0, 0, 0])
            .withScaling(2);

        const renderTargetMapDetails = graph
            .createRenderTarget("rt-mapDetails")
            .withDepth(true)
            .withInput(drawMapDetails);

        // COMBINE =================================

        const vertexCreatorCombine = graph
            .createVertexCreator("gen-combine")
            .withOutput(FullscreenQuadVertexGenerator.OUTPUT_ID, "vertices", [
                {
                    name: "in_position",
                    type: GLAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ])
            .withFunction(FullscreenQuadVertexGenerator.func);

        const vertexDescriptorCombine = graph
            .createVertexDescriptor("vd-combine")
            .withInput(vertexCreatorCombine.useOutput(FullscreenQuadVertexGenerator.OUTPUT_ID));


        const shaderCombine = graph
            .createShader("shader-combine")
            .withVertexShaderSource(shaderSourceManager.get("combine.vert"))
            .withFragmentShaderSource(shaderSourceManager.get("combine.frag"))

            .withProperty(commonProperties.time, "u_common.timestamp")
            .withProperty(textureNodes.noiseWatercolor, "u_common.noise")
            .withProperty(commonProperties.cameraInvVPM, "u_common.invViewProjection")

            .withProperty(renderTargetWater, "u_water.layer")
            .withProperty(configProps.waterColorLight, "u_water.colorLight")
            .withProperty(configProps.waterColorDark, "u_water.colorDark")
            .withProperty(configProps.waterWaveDistortionStrength, "u_water.waveDistortionStrength")
            .withProperty(configProps.waterWaveDistortionScale, "u_water.waveDistortionScale")
            .withProperty(configProps.waterWaveSpeed, "u_water.waveSpeed")
            .withProperty(configProps.waterWaveSharpness, "u_water.waveSharpnesss")

            .withProperty(renderTargetLand, "u_land.layer")
            .withProperty(configProps.landCutoffThreshold, "u_land.cutoff")
            .withProperty(configProps.landOutlineLightSize, "u_land.outlineSizeLight")
            .withProperty(configProps.landOutlineDarkSize, "u_land.outlineSizeDark")

            .withProperty(renderTargetFog, "u_fog.layer")
            .withProperty(configProps.fogUnknownColor, "u_fog.colorUnknown")
            .withProperty(configProps.fogDiscoveredColor, "u_fog.colorDiscovered")

            .withProperty(renderTargetMapDetails, "u_mapDetails.layer")

            .withProperty(renderTargetOverlay, "u_overlay.layer")

            .withProperty(textureNodes.textureParchment, "u_paper.large.texture")
            .withProperty(configProps.paperLargeScale, "u_paper.large.scale")
            .withProperty(configProps.paperLargeStrength, "u_paper.large.strength")
            .withProperty(configProps.paperLargeContrast, "u_paper.large.contrast")

            .withProperty(textureNodes.textureConcrete, "u_paper.medium.texture")
            .withProperty(configProps.paperMediumScale, "u_paper.medium.scale")
            .withProperty(configProps.paperMediumStrength, "u_paper.medium.strength")
            .withProperty(configProps.paperMediumContrast, "u_paper.medium.contrast")

            .withProperty(textureNodes.texturePaper, "u_paper.small.texture")
            .withProperty(configProps.paperSmallScale, "u_paper.small.scale")
            .withProperty(configProps.paperSmallStrength, "u_paper.small.strength")
            .withProperty(configProps.paperSmallContrast, "u_paper.small.contrast")

            .withProperty(textureNodes.textureClouds, "u_paper.clouds.texture")
            .withProperty(configProps.paperCloudsScale, "u_paper.clouds.scale")
            .withProperty(configProps.paperCloudsStrength, "u_paper.clouds.strength")
            .withProperty(configProps.paperCloudsContrast, "u_paper.clouds.contrast")

            .withProperty(textureNodes.lut, "u_lutColorCorrection")
            .withProperty(textureNodes.lutSize, "u_lutSize");

        const drawCombine = graph
            .createDraw("draw-combine")
            .withCamera(commonProperties.camera)
            .withShaderProgram(shaderCombine)
            .withVertexDescriptor(vertexDescriptorCombine)
            .withClearColor([0, 0, 0, 1])
            .withScaling(1);

        // LABELS ==================================

        const creatorLabels = graph
            .createRenderElementGenerator("gen-labels")
            .withProperty(commonProperties.worldObjects, "worldObjects")
            .withProperty(commonProperties.cameraVPM, "_camera")
            .withFunction(LabelsElementGenerator.funcCreate)
            .withOutput(LabelsElementGenerator.OUTPUT_ID);

        const htmlRendererLabels = graph
            .createHtmlRender("html-labels")
            .withCullingRadius(2)
            .withTemplateFunc(LabelsElementGenerator.funcTemplate)
            .withRenderFunc(LabelsElementGenerator.funcRender)
            .withElements(creatorLabels.useOutput(LabelsElementGenerator.OUTPUT_ID));

        // RESOURCE ICONS ==========================

        const creatorResourceIcons = graph
            .createRenderElementGenerator("gen-resourceicons")
            .withProperty(commonProperties.tiles, "relevantTiles")
            .withProperty(commonProperties.mapMode, "mapMode")
            .withProperty(commonProperties.cameraVPM, "_camera")
            .withFunction(ResourceIconsElementGenerator.funcCreate)
            .withOutput(ResourceIconsElementGenerator.OUTPUT_ID);

        const htmlRendererResourceIcons = graph
            .createHtmlRender("html-resourceicons")
            .withCullingRadius(1)
            .withLowQualityThreshold(200)
            .withTemplateFunc(ResourceIconsElementGenerator.funcTemplate)
            .withRenderFunc(ResourceIconsElementGenerator.funcRender)
            .withElements(creatorResourceIcons.useOutput(ResourceIconsElementGenerator.OUTPUT_ID));

        // MOVE PATHS ==============================

        const creatorMovePaths = graph
            .createRenderElementGenerator("gen-movepaths")
            .withProperty(commonProperties.movePaths, "movePaths")
            .withProperty(commonProperties.cameraVPM, "_camera")
            .withFunction(MovePathsElementGenerator.funcCreate)
            .withOutput(MovePathsElementGenerator.OUTPUT_ID);

        const htmlRendererMovePaths = graph
            .createHtmlRender("html-movepaths")
            .withCullingRadius(9999999)
            .withTemplateFunc(MovePathsElementGenerator.funcTemplate)
            .withRenderFunc(MovePathsElementGenerator.funcRender)
            .withElements(creatorMovePaths.useOutput(MovePathsElementGenerator.OUTPUT_ID));


        // FINAL OUTPUT ============================

        graph
            .createCanvas("canvas-screen")
            .withInput(drawCombine);

        graph
            .createContainer("canvas-html")
            .withElementId("game-canvas-overlay")
            .withCamera(commonProperties.camera)
            .withInput(htmlRendererMovePaths)
            .withInput(htmlRendererResourceIcons)
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

    private configureBaseRenderGraph(gl: WebGL2RenderingContext): RenderGraph {
        return new RenderGraph(
            new RenderGraphSorter(),
            new RenderGraphResourceManager(
                RenderGraphKeys.frameId(),
                [
                    new FrameIdResourceGenerator(),
                    new WebGLContextResourceCreator(gl),
                    new PropertyResourceCreator(),
                    new FramebufferResourceCreator(gl),
                    new TextureResourceCreator(gl),
                    new ShaderProgramResourceCreator(gl),
                    new VertexArrayResourceCreator(gl),
                    new VertexBufferResourceCreator(gl),
                    new VertexInfoResourceCreator(),
                    new GeneratorDataResourceCreator(node => node instanceof RenderElementGeneratorRenderGraphNode, [], data => data.length = 0),
                    new GeneratorDataResourceCreator(node => node instanceof IntermediateDataGeneratorRenderGraphNode, null, _ => undefined),
                    new HtmlElementPoolResourceCreator(),
                    new CachedHtmlElementResourceCreator(),
                ],
            ),
            new RenderGraphCompiler([
                new InitNodeCompiler(),
                new PropertyNodeCompiler(),
                new VertexGeneratorNodeCompiler(),
                new WebglShaderNodeCompiler(),
                new WebglDrawNodeCompiler(),
                new DataGeneratorNodeCompiler(node => node instanceof RenderElementGeneratorRenderGraphNode),
                new DataGeneratorNodeCompiler(node => node instanceof IntermediateDataGeneratorRenderGraphNode),
                new HtmlDrawNodeCompiler(),
            ]),
        );
    }

    private createConfigurationProperties(graph: RenderGraph) {
        return {
            landColorLight: graph
                .createPropertyConstant<[number, number, number]>("colorLandLight")
                .withType(GLUniformType.VEC3)
                .withValue(this.hexToRgb("#949b64")),
            landColorDark: graph
                .createPropertyConstant<[number, number, number]>("colorLandDark")
                .withType(GLUniformType.VEC3)
                .withValue(this.hexToRgb("#747e57")),
            landCutoffThreshold: graph
                .createPropertyConstant<number>("landCutoffThreshold")
                .withType(GLUniformType.FLOAT)
                .withValue(0.5),
            landOutlineLightSize: graph
                .createPropertyConstant<number>("landOutlineSizeLight")
                .withType(GLUniformType.FLOAT)
                .withValue(0.003),
            landOutlineDarkSize: graph
                .createPropertyConstant<number>("landOutlineSizeDark")
                .withType(GLUniformType.FLOAT)
                .withValue(0.002),
            waterColorLight: graph
                .createPropertyConstant<[number, number, number]>("colorWaterLight")
                .withType(GLUniformType.VEC3)
                .withValue(this.hexToRgb("#a5c0c5")),
            waterColorDark: graph
                .createPropertyConstant<[number, number, number]>("colorWaterDark")
                .withType(GLUniformType.VEC3)
                .withValue(this.hexToRgb("#7995ae")),
            waterWaveDistortionStrength: graph
                .createPropertyConstant<number>("waterWaveDistortionStrength")
                .withType(GLUniformType.FLOAT)
                .withValue(0.225),
            waterWaveDistortionScale: graph
                .createPropertyConstant<number>("waterWaveDistortionScale")
                .withType(GLUniformType.FLOAT)
                .withValue(0.05),
            waterWaveSpeed: graph
                .createPropertyConstant<number>("waterWaveSpeed")
                .withType(GLUniformType.FLOAT)
                .withValue(1.15),
            waterWaveSharpness: graph
                .createPropertyConstant<number>("waterWaveSharpness")
                .withType(GLUniformType.FLOAT)
                .withValue(1.5),
            fogUnknownColor: graph
                .createPropertyConstant<[number, number, number, number]>("fogColorUnknown")
                .withType(GLUniformType.VEC4)
                .withValue([0.149, 0.122, 0.082, 1]),
            fogDiscoveredColor: graph
                .createPropertyConstant<[number, number, number, number]>("fogColorDiscovered")
                .withType(GLUniformType.VEC4)
                .withValue([0.149, 0.122, 0.082, 0.6]),
            paperLargeScale: graph
                .createPropertyConstant<number>("paperLargeScale")
                .withType(GLUniformType.FLOAT)
                .withValue(0.002),
            paperLargeStrength: graph
                .createPropertyConstant<number>("paperLargeStrength")
                .withType(GLUniformType.FLOAT)
                .withValue(0.25),
            paperLargeContrast: graph
                .createPropertyConstant<number>("paperLargeContrast")
                .withType(GLUniformType.FLOAT)
                .withValue(2),
            paperMediumScale: graph
                .createPropertyConstant<number>("paperMediumScale")
                .withType(GLUniformType.FLOAT)
                .withValue(0.002),
            paperMediumStrength: graph
                .createPropertyConstant<number>("paperMediumStrength")
                .withType(GLUniformType.FLOAT)
                .withValue(0.3),
            paperMediumContrast: graph
                .createPropertyConstant<number>("paperMediumContrast")
                .withType(GLUniformType.FLOAT)
                .withValue(1),
            paperSmallScale: graph
                .createPropertyConstant<number>("paperSmallScale")
                .withType(GLUniformType.FLOAT)
                .withValue(0.005),
            paperSmallStrength: graph
                .createPropertyConstant<number>("paperSmallStrength")
                .withType(GLUniformType.FLOAT)
                .withValue(0.2),
            paperSmallContrast: graph
                .createPropertyConstant<number>("paperSmallContrast")
                .withType(GLUniformType.FLOAT)
                .withValue(2),
            paperCloudsScale: graph
                .createPropertyConstant<number>("paperCloudsScale")
                .withType(GLUniformType.FLOAT)
                .withValue(0.003),
            paperCloudsStrength: graph
                .createPropertyConstant<number>("paperCloudsStrength")
                .withType(GLUniformType.FLOAT)
                .withValue(0.2),
            paperCloudsContrast: graph
                .createPropertyConstant<number>("paperCloudsContrast")
                .withType(GLUniformType.FLOAT)
                .withValue(1),
            overlayBorderThickness: graph
                .createPropertyConstant<number>("overlay.borderThickness")
                .withValue(0.15)
                .withType(GLUniformType.FLOAT),
            overlayBorderOpacity: graph
                .createPropertyConstant<number>("overlay.borderOpacity")
                .withValue(1.0)
                .withType(GLUniformType.FLOAT),
            overlayFillOpacity: graph
                .createPropertyConstant<number>("overlay.fillOpacity")
                .withValue(0.5)
                .withType(GLUniformType.FLOAT),
            selectedTileThickness: graph
                .createPropertyConstant<number>("overlay.tileSelection.thickness")
                .withValue(0.1)
                .withType(GLUniformType.FLOAT),
            selectedTileColor0: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileSelection.color0")
                .withValue([255 / 255, 215 / 255, 0 / 255, 1.0])
                .withType(GLUniformType.VEC4),
            selectedTileColor1: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileSelection.color1")
                .withValue([1.0, 1.0, 1.0, 1.0])
                .withType(GLUniformType.VEC4),
            tileHighlightGap: graph
                .createPropertyConstant<number>("overlay.tileHighlight.gap")
                .withValue(0.05)
                .withType(GLUniformType.FLOAT),
            tileHighlightColorOuterDefault: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorOuterDefault")
                .withValue([1.0, 1.0, 0.7, 0.6])
                .withType(GLUniformType.VEC4),
            tileHighlightColorInnerDefault: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorInnerDefault")
                .withValue([1.0, 1.0, 1.0, 0.0])
                .withType(GLUniformType.VEC4),
            tileHighlightColorOuterHover: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorOuterHover")
                .withValue([1.0, 1.0, 0.9, 0.6])
                .withType(GLUniformType.VEC4),
            tileHighlightColorInnerHover: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorInnerHover")
                .withValue([1.0, 1.0, 1.0, 0.0])
                .withType(GLUniformType.VEC4),
            tileHighlightColorOuterActive: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorOuterActive")
                .withValue([0.4, 0.5, 1.0, 0.6])
                .withType(GLUniformType.VEC4),
            tileHighlightColorInnerActive: graph
                .createPropertyConstant<[number, number, number, number]>("overlay.tileHighlight.colorInnerActive")
                .withValue([1.0, 1.0, 1.0, 0.0])
                .withType(GLUniformType.VEC4),
        };
    }

    private createCommonProperties(graph: RenderGraph, changeTracker: GameChangeTracker, canvasHandle: CanvasHandle, wasmGameRenderer: WasmGameRenderer) {
        const mapMode = graph
            .createPropertyDynamic<MapMode>("prop-mapMode")
            .withChangeTest(() => changeTracker.getTrackedChanges().mapMode)
            .withValue(() => MapStateAccess.getMapMode());
        const highlightedTiles = graph
            .createPropertyDynamic<Tile.Highlight[]>("prop-highlightedTiles")
            .withChangeTest(() => changeTracker.getTrackedChanges().highlightedTiles)
            .withValue(() => TileStateAccess.getHighlights());
        const worldObjects = graph
            .createPropertyDynamic<WorldObject[]>("prop-worldObjects")
            .withChangeTest(() => changeTracker.getTrackedChanges().worldObjects || changeTracker.getTrackedChanges().commands)
            .withValue(() => WorldObjectStateAccess.getAll());
        const routes = graph
            .createPropertyDynamic<Route[]>("prop-routes")
            .withChangeTest(() => changeTracker.getTrackedChanges().routes || changeTracker.getTrackedChanges().commands)
            .withValue(() => RouteStateAccess.getAll());
        const tiles = graph
            .createPropertyDynamic<Tile[]>("prop-tiles")
            .withChangeTest(() => changeTracker.getTrackedChanges().tiles || changeTracker.getTrackedChanges().commands)
            .withValue(() => TileStateAccess.getAll());
        const camera = graph
            .createPropertyDynamic<Camera>("prop-camera")
            .withChangeTest(() => changeTracker.getTrackedChanges().camera)
            .withValue(() => {
                return Camera.create(
                    CameraStateAccess.get(),
                    canvasHandle.getCanvasWidth(),
                    canvasHandle.getCanvasHeight(),
                    canvasHandle.getClientWidth(),
                    canvasHandle.getClientHeight(),
                );
            });
        return {
            tiles: tiles,
            tilesWasm: graph
                .createPropertyWasm<Tile[]>("prop-wasm-tiles")
                .withValue(tiles, it => wasmGameRenderer.setTiles(it)),
            worldObjects: worldObjects,
            worldObjectsWasm: graph
                .createPropertyWasm<WorldObject[]>("prop-wasm-worldObjects")
                .withValue(worldObjects, it => wasmGameRenderer.setWorldObjects(it)),
            routesWasm: graph
                .createPropertyWasm<Route[]>("prop-wasm-routes")
                .withValue(routes, it => wasmGameRenderer.setRoutes(it)),
            mapMode: mapMode,
            mapModeWasm: graph
                .createPropertyWasm<MapMode>("prop-wasm-mapMode")
                .withValue(mapMode, it => wasmGameRenderer.setMapMode(it)),
            highlightedTilesWasm: graph
                .createPropertyWasm<Tile.Highlight[]>("prop-wasm-highlightedTiles")
                .withValue(highlightedTiles, it => wasmGameRenderer.setHighlightedTiles(it)),
            movePaths: graph
                .createPropertyDynamic<({ tiles: TileSummary[], pending: boolean })[]>("prop-movePaths")
                .withChangeTest(() => changeTracker.getTrackedChanges().movementPaths)
                .withValue(() => {
                    const paths: ({ tiles: TileSummary[], pending: boolean })[] = [];
                    CommandStateAccess.getAllOfType(Command.Type.Move).forEach(command => {
                        paths.push({
                            tiles: command.path,
                            pending: false,
                        });
                    });
                    if (gameInteractionEngine.getInteractionId() === worldObjectMoveInteractionDefinition.id) {
                        const context = gameInteractionEngine.getInteractionContext<WorldObjectMoveInteractionContext>();
                        if (context && context.path.length > 0) {
                            paths.push({
                                tiles: context.path,
                                pending: true,
                            });
                        }
                    }
                    return paths;
                }),
            selectedTile: graph
                .createPropertyDynamic<[number, number]>("prop-selectedTile")
                .withValue(() => TileStateAccess.getSelected() ? [TileStateAccess.getSelected()?.position.q, TileStateAccess.getSelected()?.position.r] as [number, number] : [99999, 99999])
                .withChangeTest(() => changeTracker.getTrackedChanges().selectedTile)
                .withType(GLUniformType.INT_VEC2),
            hoveredTile: graph
                .createPropertyDynamic<[number, number]>("prop-hoveredTile")
                .withValue(() => TileStateAccess.getHovered() ? [TileStateAccess.getHovered()?.position.q, TileStateAccess.getHovered()?.position.r] as [number, number] : [99999, 99999])
                .withChangeTest(() => changeTracker.getTrackedChanges().hoveredTile)
                .withType(GLUniformType.INT_VEC2),
            camera: camera,
            cameraVPM: graph
                .createPropertyDerived<Float32Array>("prop-camera-vpm")
                .withType(GLUniformType.MAT3)
                .withValue(camera, camera => camera.getViewProjectionMatrixOrThrow(true)),
            cameraInvVPM: graph
                .createPropertyDerived<Float32Array>("prop-camera-inv-vpm")
                .withType(GLUniformType.MAT3)
                .withValue(camera, camera => mat3.inverse(camera.getViewProjectionMatrixOrThrow(true))),
            time: graph
                .createPropertyDynamic<number>("prop-time")
                .withValue(() => (Date.now() / 1000) % 10000)
                .withChangeTest(() => true)
                .withType(GLUniformType.FLOAT),
        };
    }

    private createTextureNodes(graph: RenderGraph) {
        const lutNormal = graph
            .createTexture("tx-lut_normal")
            .withUrl("/lut/lut_64_corrected.png")
            .withConfig({
                filterMin: GLTextureMinFilter.NEAREST,
                filterMag: GLTextureMagFilter.NEAREST,
                wrap: GLTextureWrap.CLAMP_TO_EDGE,
            });
        const lutGrayscale = graph
            .createTexture("tx-lut_grayscale")
            .withUrl("/lut/lut_64_grayscale.png")
            .withConfig({
                filterMin: GLTextureMinFilter.NEAREST,
                filterMag: GLTextureMagFilter.NEAREST,
                wrap: GLTextureWrap.CLAMP_TO_EDGE,
            });
        return {
            groundSplotch: graph
                .createTexture("txtr-ground-splotch")
                .withUrl("/textures/groundSplotches.png"),
            noiseWatercolor: graph
                .createTexture("txtr-noise_watercolor")
                .withUrl("/textures/noise_watercolor.png"),
            textureClouds: graph
                .createTexture("txtr-clouds")
                .withUrl("/textures/noise_watercolor.png"),
            textureParchment: graph
                .createTexture("txtr-parchment")
                .withUrl("/textures/seamless_parchment_texture.jpg"),
            textureConcrete: graph
                .createTexture("txtr-concrete")
                .withUrl("/textures/non_uniform_concret_wall.jpg"),
            texturePaper: graph
                .createTexture("txtr-paper")
                .withUrl("/textures/seamless_paper_texture.jpg"),
            tilesetColor: graph
                .createTexture("txtr-tileset_color")
                .withUrl("/tileset_color.png"),
            tilesetOutline: graph
                .createTexture("txtr-tileset_outline")
                .withUrl("/tileset_outline.png"),
            tilesetMask: graph
                .createTexture("txtr-tileset_mask")
                .withUrl("/tileset_mask.png"),
            lutSize: graph
                .createPropertyConstant<number>("prop-lutSize")
                .withType(GLUniformType.FLOAT)
                .withValue(64),
            lutNormal: lutNormal,
            lutGrayscale: lutGrayscale,
            lut: graph
                .createConditionalTexture("ctxtr-lut")
                .withOption(lutNormal, () => !MapStateAccess.getMapMode().renderData.grayscale)
                .withOption(lutGrayscale, () => MapStateAccess.getMapMode().renderData.grayscale),
        };
    }

}