import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";
import type {WebGlDrawCallNode} from "@modules/rendergraph/compile/webgl/webgl-draw-call-graph.node.ts";


export function buildWebglDrawCallGraph(renderGraphNodes: RenderGraphNode[]): WebGlDrawCallNode[] {

    // build list of all draw calls (including canvas output)
    const webglDrawCallNodes: WebGlDrawCallNode[] = [];
    renderGraphNodes.forEach(node => {
        if (node.type === "draw") {
            webglDrawCallNodes.push({
                node: node,
                rendertarget: null,
                dependsOn: [],
                requiresResources: {
                    shader: null,
                    geometry: null,
                    textures: [],
                    texturesSelect: [],
                    rendertargets: [],
                },
            });
        }
    });

    // find render targets as outputs of draw calls
    webglDrawCallNodes.forEach(drawCallNode => {
        const graphNode = drawCallNode.node;
        if (graphNode.type === "draw") {

            renderGraphNodes.forEach(node => {
                if (node.type === "rendertarget") {
                    if (node.renderPasses.includes(graphNode)) {
                        drawCallNode.rendertarget = node;
                    }
                }
            });

        }
    });

    // find required resources for each draw call
    webglDrawCallNodes.forEach(drawCallNode => {
        const graphNode = drawCallNode.node;
        if (graphNode.type === "draw") {
            // shader
            drawCallNode.requiresResources.shader = graphNode.shader;
            // geometry
            drawCallNode.requiresResources.geometry = graphNode.geometry;
            // other inputs
            Object.values(graphNode.inputs).forEach(input => {
                if (input.type === "texture") {
                    drawCallNode.requiresResources.textures.push(input);
                }
                if (input.type === "rendertarget") {
                    drawCallNode.requiresResources.rendertargets.push(input);
                }
                if (input.type === "select-texture") {
                    drawCallNode.requiresResources.texturesSelect.push(input);
                }
            });
        }
    });

    // find dependencies between draw calls based on fixed sequence to same output
    webglDrawCallNodes.forEach(a => {
        webglDrawCallNodes.forEach(b => {
            if (a === b) return;
            if (a.rendertarget != null && b.requiresResources.rendertargets.includes(a.rendertarget)) {
                b.dependsOn.push(a);
            }
        });
    });

    // find dependencies between draw calls based on input and output rendertarget
    renderGraphNodes.forEach(node => {
        if (node.type === "canvas") {
            const drawCallNodes = node.renderPasses.map(it => webglDrawCallNodes.find(n => n.node === it)!);
            for (let i = 1; i < drawCallNodes.length; i++) {
                drawCallNodes[i].dependsOn.push(drawCallNodes[i - 1]);
            }
        }
        if (node.type === "rendertarget") {
            const drawCallNodes = node.renderPasses.map(it => webglDrawCallNodes.find(n => n.node === it)!);
            for (let i = 1; i < drawCallNodes.length; i++) {
                drawCallNodes[i].dependsOn.push(drawCallNodes[i - 1]);
            }
        }
    });

    return webglDrawCallNodes;
}