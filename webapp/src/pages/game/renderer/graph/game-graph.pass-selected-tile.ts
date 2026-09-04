import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {CameraRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.camera.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {DebugData} from "@app/features/game/database/debug.database.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {GlAttributeType} from "@modules/rendergraph/webgl/gl-program.ts";
import SHADER_SELECTED_TILE_VERT from "./../shader/selectedTile.vsh";
import SHADER_SELECTED_TILE_FRAG from "./../shader/selectedTile.fsh";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";

export function gameGraphPassSelectedTile(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        camera: CameraRenderGraphNode,
        dataDebug: DataRenderGraphNode<VersionedContainer<DebugData>>
    },
) {

    const dataSelectedTile = g.dataExternal<HexPosition | null>(
        prev => prev?.q != dataProvider.getSelectedTilePosition()?.q || prev?.r != dataProvider.getSelectedTilePosition()?.r,
        () => dataProvider.getSelectedTilePosition(),
    );

    const meshTransformer = g.transformVertexOut({
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

            const buffer = new ArrayBuffer(3 * 2 * (3 + 2) * GlAttributeType.FLOAT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            function pushFloat32Vec3(x: number, y: number, z: number) {
                pushFloat32(x);
                pushFloat32(y);
                pushFloat32(z);
            }

            function pushFloat32Vec2(x: number, y: number) {
                pushFloat32(x);
                pushFloat32(y);
            }

            // first triangle
            pushFloat32Vec3(-1, 0, -1);
            pushFloat32Vec2(0, 0);

            pushFloat32Vec3(+1, 0, -1);
            pushFloat32Vec2(1, 0);

            pushFloat32Vec3(+1, 0, +1);
            pushFloat32Vec2(1, 1);

            // second triangle
            pushFloat32Vec3(-1, 0, -1);
            pushFloat32Vec2(0, 0);

            pushFloat32Vec3(-1, 0, +1);
            pushFloat32Vec2(0, 1);

            pushFloat32Vec3(+1, 0, +1);
            pushFloat32Vec2(1, 1);

            return {
                "mesh": {
                    data: buffer,
                    count: 3 * 2,
                },
            };

        },
    });

    const instanceTransformer = g.transformVertexOut({
        inputs: [dataSelectedTile],
        outputs: {
            instances: {
                content: "instances",
                layout: [
                    {
                        name: "tilePosition",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                    },
                ],
            },
        },
        func: (selectedTile: HexPosition | null) => {

            const buffer = new ArrayBuffer((selectedTile === null ? 0 : 1) * 2 * GlAttributeType.FLOAT.bytes);
            const view = new DataView(buffer);
            let viewCounter = 0;

            function pushFloat32(value: number) {
                view.setFloat32(viewCounter, value, true);
                viewCounter += GlAttributeType.FLOAT.bytes;
            }

            function pushFloat32Vec2(x: number, y: number) {
                pushFloat32(x);
                pushFloat32(y);
            }

            if (selectedTile) {
                pushFloat32Vec2(selectedTile.q, selectedTile.r);
            }

            return {
                "instances": {
                    data: buffer,
                    count: (selectedTile === null ? 0 : 1),
                },
            };
        },
    });

    const geometry = g.geometry({
        sources: [
            g.geometrySource({
                source: meshTransformer,
                output: "mesh",
            }),
            g.geometrySource({
                source: instanceTransformer,
                output: "instances",
            }),
        ],
    });

    const shader = g.shader({
        srcVertex: SHADER_SELECTED_TILE_VERT,
        srcFragment: SHADER_SELECTED_TILE_FRAG,
        prefixUniforms: "u_",
        prefixVertexAttributes: "in_",
    });

    const dataDebugThickness = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.selectedTile.thickness
        })
    )

    const dataDebugSoftness = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => data.data.renderer.selectedTile.softness
        })
    )

    const dataDebugColor = g.dataTransformer(
        g.transform({
            inputs: [inputs.dataDebug],
            func: (data) => {
                return data.data.renderer.selectedTile.color
            }
        })
    )

    const draw = g.draw({
        shader: shader,
        geometry: geometry,
        inputs: {
            "camera": inputs.camera,
            "thickness": dataDebugThickness as DataRenderGraphNode<unknown>,
            "radius": g.dataConst(1) as DataRenderGraphNode<unknown>,
            "softness": dataDebugSoftness as DataRenderGraphNode<unknown>,
            "color": dataDebugColor as DataRenderGraphNode<unknown>,
        },
    });

    return {drawSelectedTile: draw};
}