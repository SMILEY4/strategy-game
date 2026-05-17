import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@rendergraph/webgl/gl-program.ts";

interface Tile {
    id: string;
    q: number,
    r: number,
    type: "land" | "water"
}

interface Camera {
    x: number;
    y: number;
}

export function foo() {

    const g = new RenderGraphBuilder();

    const tiles = g.data<Tile[]>({
        source: {
            type: "external",
            fetch: () => [],
        },
    });

    const camera = g.data<Camera>({
        source: {
            type: "external",
            fetch: () => ({x: 0, y: 0}),
        },
    });

    const visibleChunkTransformer = g.transform<[Tile[], Camera], number[]>({
        inputs: [tiles, camera],
        func: (tiles: Tile[], camera: Camera) => {
            console.log(tiles, camera);
            return [];
        },
    });

    const visibleChunks = g.data<number[]>({
        source: {
            type: "transform",
            transformer: visibleChunkTransformer,
        },
    });

    const tileGenericVertexTransformer = g.transformMultiOut<[Tile[], number[]], {
        instancesWater: number[],
        instancesLand: number[]
    }>({
        inputs: [tiles, visibleChunks],
        func: (tiles: Tile[], visibleChunks: number[]) => {
            console.log(tiles, visibleChunks);
            return {
                instancesLand: [],
                instancesWater: [],
            };
        },
    });

    const tileVertexTransformer = g.transformVertexOut<[Tile[], number[]], "instancesWater" | "instancesLand">({
        inputs: [tiles, visibleChunks],
        outputs: {
            instancesWater: [
                {
                    name: "in_position",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                }
            ],
            instancesLand: [
                {
                    name: "in_position",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                }
            ],
        },
        func: (tiles: Tile[], visibleChunks: number[]) => {
            console.log(tiles, visibleChunks);
            return {
                instancesLand: {
                    data: new ArrayBuffer(8),
                    count: 0
                },
                instancesWater: {
                    data: new ArrayBuffer(8),
                    count: 0
                },
            };
        },
    });

    const tilesLandGeometry = g.geometry({
        sources: [
            {
                source: tileVertexTransformer,
                output: "instancesWater"
            },
            {
                source: tileVertexTransformer,
                output: "instancesLand"
            }
        ]
    })

    const instancesWater = g.data({
        source: {
            type: "transform-multi-out",
            transformer: tileGenericVertexTransformer,
            key: "instancesWater"
        }
    })

    const groundColor = g.data<[number, number, number]>({
        source: {
            type: "constant",
            value: [0, 1, 0],
        },
    });

    const noiseTexture = g.texture({
        url: "/noise.png",
    });

    const tileBaseTexture = g.texture({
        url: "/tile-base.png",
    });

    const mapMode = g.data<"terrain" | "resources" | "political">({
        source: {
            type: "constant",
            value: "terrain",
        },
    });

    const lutTerrainTexture = g.texture({
        url: "/lut-terrain.png",
    });

    const lutGrayscaleTexture = g.texture({
        url: "/lut-grayscale.png",
    });

    const lutTexture = g.selectTexture({
        input: mapMode,
        options: {
            terrain: lutTerrainTexture,
            grayscale: lutGrayscaleTexture
        },
        selector: (mapMode: "terrain" | "resources" | "political") => mapMode === "terrain" ? "terrain" : "grayscale"
    })

    const shaderLand = g.shader({
        srcFragment: "...",
        srcVertex: "...",
    });

    const drawLand = g.draw({
        shader: shaderLand,
        geometry: tilesLandGeometry,
        inputs: {
            "u_noise": noiseTexture,
            "u_base": tileBaseTexture,
            "u_color": groundColor,
            "u_instancesWater": instancesWater,
            "u_lut": lutTexture
        },
    });

    const canvas = g.canvas({
        renderPasses: [
            drawLand,
        ],
    });

    console.log(canvas, g.getNodes());
}