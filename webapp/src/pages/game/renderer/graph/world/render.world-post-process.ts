import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import {buildFullscreenQuad} from "@pages/game/renderer/graph/utils/build-fullscreen-quad.ts";
import {DepthFunc} from "@modules/rendergraph/nodes/rg-node.draw.ts";
import SHADER_WORLD_PP_VERT from "@pages/game/renderer/shader/worldPostProcess/worldPostProcess.vsh";
import SHADER_WORLD_PP_FRAG from "@pages/game/renderer/shader/worldPostProcess/worldPostProcess.fsh";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import {MapMode} from "@app/features/game/models/map-mode.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";

type ColorGrading = {
    exposure: number,
    temperature: number,
    tint: number,
    brightness: number,
    contrast: number,
    blacks: number,
    whites: number,
    shadows: number,
    highlights: number,
    vibrance: number,
    saturation: number,
}

const colorGradingNormal: ColorGrading = {
    exposure: 0,
    temperature: 0,
    tint: 0,
    brightness: 0,
    contrast: 0,
    blacks: 0,
    whites: 0,
    shadows: 0,
    highlights: 0,
    vibrance: 0,
    saturation: 0,
}

const colorGradingGrayscale: ColorGrading = {
    exposure: 0,
    temperature: 0,
    tint: 0,
    brightness: 0,
    contrast: 0,
    blacks: 0,
    whites: 0,
    shadows: 0,
    highlights: 0,
    vibrance: 0,
    saturation: -1,
}

export function renderWorldPostProcess(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataDeveloperSettings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
        camera: CameraRenderGraphNode,
        dataPointerHexPosition: DataRenderGraphNode<[number, number]>,
        world: RendertargetRenderGraphNode<"color" | "depth">
    },
) {

    const dataMapMode = g.dataExternal<MapMode>(
        prev => prev.id !== dataProvider.getMapMode().id,
        () => dataProvider.getMapMode(), "map mode",
    );

    const colorGrading = g.dataTransformer<ColorGrading>(
        g.transform({
            inputs: [dataMapMode],
            func: (mapMode) => {
                if(mapMode === MapMode.TERRAIN) {
                    return colorGradingNormal
                } else {
                    return colorGradingGrayscale
                }
            },
        }),
    );

    const mesh = g.transformVertexOut({
        debugName: "post-process fullscreen mesh",
        inputs: [],
        outputs: {
            mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertexPosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: () => {
            return {
                "mesh": buildFullscreenQuad(),
            };
        },
    });


    const geometry = g.geometry({
        debugName: "post-process geometry",
        sources: [
            g.geometrySource({
                source: mesh,
                output: "mesh",
            }),
        ],
    });

    const shader = g.shader({
        debugName: "world post-process shader",
        srcVertex: SHADER_WORLD_PP_VERT,
        srcFragment: SHADER_WORLD_PP_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const draw = g.draw({
        debugName: "world post-process draw",
        shader: shader,
        geometry: geometry,
        inputs: {
            "worldColor": g.pickRendertargetAttachment({
                rendertarget: inputs.world,
                attachment: "color",
            }),
            "exposure": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.exposure})) as DataRenderGraphNode<unknown>,
            "temperature": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.temperature})) as DataRenderGraphNode<unknown>,
            "tint": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.tint})) as DataRenderGraphNode<unknown>,
            "brightness": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.brightness})) as DataRenderGraphNode<unknown>,
            "contrast": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.contrast})) as DataRenderGraphNode<unknown>,
            "blacks": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.blacks})) as DataRenderGraphNode<unknown>,
            "whites": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.whites})) as DataRenderGraphNode<unknown>,
            "shadows": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.shadows})) as DataRenderGraphNode<unknown>,
            "highlights": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.highlights})) as DataRenderGraphNode<unknown>,
            "vibrance": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.vibrance})) as DataRenderGraphNode<unknown>,
            "saturation": g.dataTransformer<number>(g.transform({inputs: [colorGrading], func: data => data.saturation})) as DataRenderGraphNode<unknown>,
        },
        writeDepth: false,
        testDepth: DepthFunc.ALWAYS,
    });

    return {
        drawWorldPostProcess: draw,
    };
}
