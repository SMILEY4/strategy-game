import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RenderWasmApi} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {WasmDataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.wasm-data.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {createUnitHexagonMesh} from "@modules/utilities/hex-geometry.ts";
import SHADER_WATER_VERT from "@pages/game/renderer/shader/baseTerrain/water.vsh";
import SHADER_WATER_FRAG from "@pages/game/renderer/shader/baseTerrain/water.fsh";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import SHADER_LAND_VERT from "@pages/game/renderer/shader/baseTerrain/land.vsh";
import SHADER_LAND_FRAG from "@pages/game/renderer/shader/baseTerrain/land.fsh";
import {developerSetting, hexToUniformColor} from "@pages/game/renderer/graph/developer-settings.ts";

export function renderTerrain(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        warmTileLandInstances: WasmDataRenderGraphNode,
        wasmTileWaterInstances: WasmDataRenderGraphNode,
        renderTargetBaseTerrainMask: RendertargetRenderGraphNode<"color">
    },
) {
    return {
        drawTerrainWater: renderWater(g, wasmApi, inputs),
        drawTerrainLand: renderLand(g, wasmApi, inputs),
    }
}


function renderWater(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        wasmTileWaterInstances: WasmDataRenderGraphNode,
        renderTargetBaseTerrainMask: RendertargetRenderGraphNode<"color">
    },
) {

    const mesh = g.transformVertexOut({
        inputs: [],
        outputs: {
            mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonMesh(true, false),
                    count: 6 * 3,
                },
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: mesh,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.wasmTileWaterInstances,
                download: () => wasmApi.download.getTileWaterInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            }),
        ],
    });

    const textureTerrainSplat = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const shader = g.shader({
        srcVertex: SHADER_WATER_VERT,
        srcFragment: SHADER_WATER_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    return g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "resolution": g.canvasSize(),
            "scale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.terrain.base.scale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.geometry.hexOffsetScale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "waterLightColor": developerSetting(g, inputs.dataDeveloperSettings, settings => hexToUniformColor(settings.renderer.terrain.base.waterLightColor)),
            "waterDarkColor": developerSetting(g, inputs.dataDeveloperSettings, settings => hexToUniformColor(settings.renderer.terrain.base.waterDarkColor)),
            "edgeThreshold": developerSetting(g, inputs.dataDeveloperSettings, settings => settings.renderer.terrain.coastline.edgeThreshold),
            "edgeSoftness": developerSetting(g, inputs.dataDeveloperSettings, settings => settings.renderer.terrain.coastline.edgeSoftness),
            "terrainSplat": textureTerrainSplat,
            "terrainMask": g.pickRendertargetAttachment({
                rendertarget: inputs.renderTargetBaseTerrainMask,
                attachment: "color",
            }),
        },
        writeDepth: true,
        testDepth: DepthFunc.ALWAYS,
    });

}


function renderLand(
    g: RenderGraphBuilder,
    wasmApi: RenderWasmApi,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        warmTileLandInstances: WasmDataRenderGraphNode,
        renderTargetBaseTerrainMask: RendertargetRenderGraphNode<"color">
    },
) {

    const mesh = g.transformVertexOut({
        inputs: [],
        outputs: {
            mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                    },
                    {
                        name: "textureCoordinates",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": {
                    data: createUnitHexagonMesh(true, false),
                    count: 6 * 3,
                },
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: mesh,
                output: "mesh",
            }),
            g.wasmGeometrySource({
                source: inputs.warmTileLandInstances,
                download: () => wasmApi.download.getTileLandInstances(),
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            }),
        ],
    });

    const textureTerrainSplat = g.texture({
        url: "/sprites/base_terrain_shape.png",
    });

    const shader = g.shader({
        srcVertex: SHADER_LAND_VERT,
        srcFragment: SHADER_LAND_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    return g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "resolution": g.canvasSize(),
            "scale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.terrain.base.scale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "hexOffsetScale": g.dataTransformer(
                g.transform({
                    inputs: [inputs.dataDeveloperSettings],
                     func: (data) => data.data.renderer.geometry.hexOffsetScale,
                }),
            ) as DataRenderGraphNode<unknown>,
            "landLightColor": developerSetting(g, inputs.dataDeveloperSettings, settings => hexToUniformColor(settings.renderer.terrain.base.landLightColor)),
            "landDarkColor": developerSetting(g, inputs.dataDeveloperSettings, settings => hexToUniformColor(settings.renderer.terrain.base.landDarkColor)),
            "edgeThreshold": developerSetting(g, inputs.dataDeveloperSettings, settings => settings.renderer.terrain.coastline.edgeThreshold),
            "edgeSoftness": developerSetting(g, inputs.dataDeveloperSettings, settings => settings.renderer.terrain.coastline.edgeSoftness),
            "terrainSplat": textureTerrainSplat,
            "terrainMask": g.pickRendertargetAttachment({
                rendertarget: inputs.renderTargetBaseTerrainMask,
                attachment: "color",
            }),
        },
        writeDepth: true,
        testDepth: DepthFunc.ALWAYS,
    });

}
