import {buildWebglDrawCallGraph} from "@rendergraph/compile/webgl/webgl-draw-call-graph.builder.ts";
import {sortWebGlDrawCallNodes} from "@rendergraph/compile/webgl/webgl-draw-call-graph.sorter.ts";
import {webglCompile} from "@rendergraph/compile/webgl/webgl-compiler.ts";
import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@rendergraph/webgl/gl-program.ts";

const nodes = buildGraph();
const drawCallNodes = buildWebglDrawCallGraph(nodes);
const sorted = sortWebGlDrawCallNodes(drawCallNodes, 32);
const {commands, resources} = webglCompile(nodes, sorted);

console.log("COMMANDS", JSON.stringify(commands.map(it => it.toDebugInfo()), null, 2));
console.log("RESOURCES", resources, JSON.stringify(resources, null, 2));


function buildGraph(): RenderGraphNode[] {

    const g = new RenderGraphBuilder();

    const transformerEntityMesh = g.transformVertexOut<[], "entity_mesh">({
        name: "transformer-entits-mesh",
        inputs: [],
        outputs: {
            entity_mesh: {
                content: "vertices",
                layout: [
                    {
                        name: "vertex_pos",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                        normalized: false,
                        stride: 0,
                        offset: 0,
                        divisor: 0,
                    },
                    {
                        name: "vertex_color",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 3,
                        normalized: false,
                        stride: 0,
                        offset: 0,
                        divisor: 0,
                    },
                ]
            },
        },
        func: () => {
            const buffer = new ArrayBuffer(4 * 5);
            const view = new Float32Array(buffer);
            view.set([0, 0, 255, 255, 255, 0, 1, 255, 255, 255, 1, 1, 255, 255, 255, 1, 0, 255, 255, 255]);
            return {
                entity_mesh: {data: buffer, count: 4},
            };
        },
    });

    const transformerEntityInstances = g.transformVertexOut<[], "entity_instances">({
        name: "transformer-entity-instances",
        inputs: [],
        outputs: {
            entity_instances: {
                content: "instances",
                layout: [
                    {
                        name: "world_pos",
                        type: GlAttributeType.FLOAT,
                        amountComponents: 2,
                        normalized: false,
                        stride: 0,
                        offset: 0,
                        divisor: 0,
                    },
                ]
            },
        },
        func: () => {
            const buffer = new ArrayBuffer(2 * 2);
            const view = new Float32Array(buffer);
            view.set([37, 21, -324, -25]);
            return {
                entity_instances: {data: buffer, count: 2},
            };
        },
    });


    const textureAC = g.texture({
        name: "texture-ac",
        url: "texture-ac",
    });

    const textureABDE = g.texture({
        name: "texture-abde",
        url: "texture-abde",
    });

    const drawCallA = g.draw({
        name: "draw-a",
        shader: g.shader({
            name: "shader-a",
            srcVertex: "shader-a.vert",
            srcFragment: "shader-a.frag",
        }),
        geometry: g.geometry({
            sources: [
                g.geometrySource({
                    source: transformerEntityInstances,
                    output: "entity_instances",
                }),
                g.geometrySource({
                    source: transformerEntityMesh,
                    output: "entity_mesh",
                }),
            ],
        }),
        inputs: {
            texture0: textureAC,
            texture1: textureABDE,
        },
    });

    const rendertarget0 = g.rendertarget({
        name: "rendertarget-0",
        renderPasses: [drawCallA],
    });

    const drawCallB = g.draw({
        name: "draw-b",
        shader: g.shader({
            name: "shader-b",
            srcVertex: "shader-b.vert",
            srcFragment: "shader-b.frag",
        }),
        geometry: g.geometry({
            sources: [],
        }),
        inputs: {
            texture: textureABDE,
        },
    });

    const shaderCF = g.shader({
        name: "shader-cf",
        srcVertex: "shader-cf.vert",
        srcFragment: "shader-cf.frag",
    });

    const drawCallC = g.draw({
        name: "draw-c",
        shader: shaderCF,
        geometry: g.geometry({
            sources: [],
        }),
        inputs: {
            rt0: rendertarget0,
            texture: textureAC,
        },
    });

    const rendertarget1 = g.rendertarget({
        name: "rendertarget-1",
        renderPasses: [
            drawCallB,
            drawCallC,
        ],
    });

    const drawCallD = g.draw({
        name: "draw-d",
        shader: g.shader({
            name: "shader-d",
            srcVertex: "shader-d.vert",
            srcFragment: "shader-d.frag",
        }),
        geometry: g.geometry({
            sources: [],
        }),
        inputs: {
            rt1: rendertarget1,
            texture: textureABDE,
        },
    });

    const drawCallE = g.draw({
        name: "draw-e",
        shader: g.shader({
            name: "shader-e",
            srcVertex: "shader-e.vert",
            srcFragment: "shader-e.frag",
        }),
        geometry: g.geometry({
            sources: [],
        }),
        inputs: {
            texture: textureABDE,
        },
    });

    const drawCallF = g.draw({
        name: "draw-f",
        shader: shaderCF,
        geometry: g.geometry({
            sources: [],
        }),
        inputs: {},
    });

    g.canvas({
        name: "canvas",
        renderPasses: [
            drawCallD,
            drawCallE,
            drawCallF,
        ],
    });

    const nodes: RenderGraphNode[] = g.getNodes();
    shuffleArray(nodes);

    return nodes;
}

function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// import {createRoot} from "react-dom/client";
// import {StrictMode} from "react";
// import {Canvas} from "@uicomponents/canvas/Canvas.tsx";
// import "./main.less"
//
// createRoot(document.getElementById("root") || document.createElement("div")).render(
//     <StrictMode>
//         <Canvas/>
//     </StrictMode>,
// );
