import {describe, expect, test} from "vitest";
import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {buildWebglDrawCallGraph} from "@rendergraph/compile/webgl/webgl-draw-call-graph.builder.ts";
import {sortWebGlDrawCallNodes} from "@rendergraph/compile/webgl/webgl-draw-call-graph.sorter.ts";
import {webglCompile} from "@rendergraph/compile/webgl/webgl-compiler.ts";

declare global {
    var WebGL2RenderingContext: typeof WebGL2RenderingContext;
}

describe("webgl draw call graph", () => {

    test("build", () => {

        const nodes = buildGraph();
        const drawCallNodes = buildWebglDrawCallGraph(nodes);

        expect(drawCallNodes).toHaveLength(6);

        const webGlDrawCallNodeA = drawCallNodes.find(it => it.node.name === "draw-a")!;
        const webGlDrawCallNodeB = drawCallNodes.find(it => it.node.name === "draw-b")!;
        const webGlDrawCallNodeC = drawCallNodes.find(it => it.node.name === "draw-c")!;
        const webGlDrawCallNodeD = drawCallNodes.find(it => it.node.name === "draw-d")!;
        const webGlDrawCallNodeE = drawCallNodes.find(it => it.node.name === "draw-e")!;
        const webGlDrawCallNodeF = drawCallNodes.find(it => it.node.name === "draw-f")!;

        expect(webGlDrawCallNodeA).toBeDefined();
        expect(webGlDrawCallNodeB).toBeDefined();
        expect(webGlDrawCallNodeC).toBeDefined();
        expect(webGlDrawCallNodeD).toBeDefined();
        expect(webGlDrawCallNodeE).toBeDefined();
        expect(webGlDrawCallNodeF).toBeDefined();

        expect(webGlDrawCallNodeA.dependsOn.map(it => it.node.name).sort()).toEqual([]);
        expect(webGlDrawCallNodeB.dependsOn.map(it => it.node.name).sort()).toEqual([]);
        expect(webGlDrawCallNodeC.dependsOn.map(it => it.node.name).sort()).toEqual(["draw-a", "draw-b"]);
        expect(webGlDrawCallNodeD.dependsOn.map(it => it.node.name).sort()).toEqual(["draw-b", "draw-c"]);
        expect(webGlDrawCallNodeE.dependsOn.map(it => it.node.name).sort()).toEqual(["draw-d"]);
        expect(webGlDrawCallNodeF.dependsOn.map(it => it.node.name).sort()).toEqual(["draw-e"]);

        expect(webGlDrawCallNodeA.requiresResources.shader?.name).toEqual("shader-a");
        expect(webGlDrawCallNodeA.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeA.requiresResources.textures.map(it => it.name).sort()).toEqual(["texture-abde", "texture-ac"]);
        expect(webGlDrawCallNodeA.requiresResources.rendertargets.map(it => it.name).sort()).toEqual([]);

        expect(webGlDrawCallNodeB.requiresResources.shader?.name).toEqual("shader-b");
        expect(webGlDrawCallNodeB.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeB.requiresResources.textures.map(it => it.name).sort()).toEqual(["texture-abde"]);
        expect(webGlDrawCallNodeB.requiresResources.rendertargets.map(it => it.name).sort()).toEqual([]);

        expect(webGlDrawCallNodeC.requiresResources.shader?.name).toEqual("shader-cf");
        expect(webGlDrawCallNodeC.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeC.requiresResources.textures.map(it => it.name).sort()).toEqual(["texture-ac"]);
        expect(webGlDrawCallNodeC.requiresResources.rendertargets.map(it => it.name).sort()).toEqual(["rendertarget-0"]);

        expect(webGlDrawCallNodeD.requiresResources.shader?.name).toEqual("shader-d");
        expect(webGlDrawCallNodeD.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeD.requiresResources.textures.map(it => it.name).sort()).toEqual(["texture-abde"]);
        expect(webGlDrawCallNodeD.requiresResources.rendertargets.map(it => it.name).sort()).toEqual(["rendertarget-1"]);

        expect(webGlDrawCallNodeE.requiresResources.shader?.name).toEqual("shader-e");
        expect(webGlDrawCallNodeE.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeE.requiresResources.textures.map(it => it.name).sort()).toEqual(["texture-abde"]);
        expect(webGlDrawCallNodeE.requiresResources.rendertargets.map(it => it.name).sort()).toEqual([]);

        expect(webGlDrawCallNodeF.requiresResources.shader?.name).toEqual("shader-cf");
        expect(webGlDrawCallNodeF.requiresResources.geometry).toBeDefined();
        expect(webGlDrawCallNodeF.requiresResources.textures.map(it => it.name).sort()).toEqual([]);
        expect(webGlDrawCallNodeF.requiresResources.rendertargets.map(it => it.name).sort()).toEqual([]);

    });

    test("sort", () => {

        const nodes = buildGraph();
        const drawCallNodes = buildWebglDrawCallGraph(nodes);

        const sorted = sortWebGlDrawCallNodes(drawCallNodes, 32);

        expect(sorted.map(it => it.node.name)).toEqual(["draw-a", "draw-b", "draw-c", "draw-d", "draw-e", "draw-f"]);

    });

    test("compile", () => {

        Object.defineProperty(globalThis, 'WebGL2RenderingContext', {
            writable: true,
            value: {
                REPEAT: -1,
                MIRRORED_REPEAT: -1,
                CLAMP_TO_EDGE: -1,
                LINEAR: -1,
                NEAREST: -1,
                NEAREST_MIPMAP_NEAREST: -1,
                LINEAR_MIPMAP_NEAREST: -1,
                NEAREST_MIPMAP_LINEAR: -1,
                LINEAR_MIPMAP_LINEAR: -1,
            }
        });

        const nodes = buildGraph();
        const drawCallNodes = buildWebglDrawCallGraph(nodes);
        const sorted = sortWebGlDrawCallNodes(drawCallNodes, 32);
        const {commands, resources} = webglCompile(nodes, sorted);

        console.log(commands, resources)

    })

});

function buildGraph(): RenderGraphNode[] {

    const g = new RenderGraphBuilder();

    const textureAC = g.texture({
        name: "texture-ac",
        url: "",
    });

    const textureABDE = g.texture({
        name: "texture-abde",
        url: "",
    });

    const drawCallA = g.draw({
        name: "draw-a",
        shader: g.shader({
            name: "shader-a",
            srcVertex: "",
            srcFragment: "",
        }),
        geometry: g.geometry({
            sources: [],
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
            srcVertex: "",
            srcFragment: "",
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
        srcVertex: "",
        srcFragment: "",
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
            srcVertex: "",
            srcFragment: "",
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
            srcVertex: "",
            srcFragment: "",
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