import {createRoot} from "react-dom/client";
import {Canvas} from "@uicomponents/canvas/Canvas.tsx";
import "./main.less"
import {WebGlRenderGraph} from "@rendergraph/render-graph.ts";
import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@rendergraph/webgl/gl-program.ts";
import SHADER_VERT from "./shader.vsh?raw";
import SHADER_FRAG from "./shader.fsh?raw";

const g = new RenderGraphBuilder()

const meshTransformer = g.transformVertexOut({
    inputs: [],
    outputs: {
        mesh: {
            content: "vertices",
            layout: [
                {
                    name: "position",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ]
        }
    },
    func: () => {
        const vertices = new Float32Array([
            -0.5, -0.5,
            +0.5, -0.5,
            +0.5, +0.5,
        ]);
        return {
            "mesh": {
                data: vertices.buffer,
                count: 3
            }
        }
    }
})

const geometry = g.geometry({
    sources: [
        g.geometrySource({
            source: meshTransformer,
            output: "mesh"
        })
    ]
})

const shader = g.shader({
    srcVertex: SHADER_VERT,
    srcFragment: SHADER_FRAG,
    prefixUniforms: "u_",
    prefixVertexAttributes: "in_",
})

const draw = g.draw({
    shader: shader,
    geometry: geometry,
    inputs: {
    }
})

g.canvas({
    renderPasses: [draw]
})

const renderGraph = WebGlRenderGraph.build(g.getNodes())

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <>
        <Canvas
            onInitialize={canvas => renderGraph.initializeCanvas(canvas)}
            onUpdate={() => renderGraph.execute()}
            onResize={canvas => renderGraph.onResizeCanvas(canvas)}
            onDispose={() => renderGraph.dispose()}
        />
        <div className={"controls"}>
            <button onClick={dumpContext}>dumpContext()</button>
        </div>
    </>
);

function dumpContext() {
    const resources = renderGraph.getExecutionContext()?.getResources() ?? []
    for (const resource of resources) {
        console.log(resource)
    }
}