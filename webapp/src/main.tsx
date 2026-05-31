import {createRoot} from "react-dom/client";
import {Canvas} from "@uicomponents/canvas/Canvas.tsx";
import "./main.less"
import {WebGlRenderGraph} from "@rendergraph/render-graph.ts";
import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@rendergraph/webgl/gl-program.ts";
import SHADER_VERT from "./shader.vsh?raw";
import SHADER_FRAG from "./shader.fsh?raw";

let valueRotation = 0;

const g = new RenderGraphBuilder()

const canvasSize = g.canvasSize()

const rotation = g.data({
    source: {
        type: "external",
        checkIsNew: () => true,
        fetch: () => valueRotation
    }
})

const meshTransformer = g.transformVertexOut({
    inputs: [],
    outputs: {
        mesh: {
            content: "vertices",
            layout: [
                {
                    name: "position",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 3,
                },
                {
                    name: "textureCoords",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                }
            ]
        }
    },
    func: () => {
        const vertices = new Float32Array([
            -1.0, -1.0,  1.0,  0.0, 0.0,
            1.0, -1.0,  1.0,  1.0, 0.0,
            0.0,  1.0,  0.0,  0.5, 1.0,
            1.0, -1.0,  1.0,  0.0, 0.0,
            1.0, -1.0, -1.0,  1.0, 0.0,
            0.0,  1.0,  0.0,  0.5, 1.0,
            1.0, -1.0, -1.0,  0.0, 0.0,
            -1.0, -1.0, -1.0,  1.0, 0.0,
            0.0,  1.0,  0.0,  0.5, 1.0,
            -1.0, -1.0, -1.0,  0.0, 0.0,
            -1.0, -1.0,  1.0,  1.0, 0.0,
            0.0,  1.0,  0.0,  0.5, 1.0,
            -1.0, -1.0, -1.0,  0.0, 1.0,
            1.0, -1.0,  1.0,  1.0, 0.0,
            -1.0, -1.0,  1.0,  0.0, 0.0,
            -1.0, -1.0, -1.0,  0.0, 1.0,
            1.0, -1.0, -1.0,  1.0, 1.0,
            1.0, -1.0,  1.0,  1.0, 0.0,
        ]);
        return {
            "mesh": {
                data: vertices.buffer,
                count: 18
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

const camera = g.cameraPerspective({
    renderTargetSize: canvasSize,
    up: g.dataConst([0, 1, 0]),
    position: g.dataConst([2, 2, 0]),
    direction: g.dataConst([-2, -2,0]),
    fov: g.dataConst(80),
    near: g.dataConst(0.001),
    far: g.dataConst(100),
});

const shader = g.shader({
    srcVertex: SHADER_VERT,
    srcFragment: SHADER_FRAG,
    prefixUniforms: "u_",
    prefixVertexAttributes: "in_",
})

const texture = g.texture({
    url: "/cobblestone.png",
})

const draw = g.draw({
    shader: shader,
    geometry: geometry,
    inputs: {
        "rotation": rotation,
        "texture": texture,
        "camera": camera
    }
})

g.canvas({
    renderPasses: [draw],
    depthTesting: true,
    clearColor: [0,0,0,0]
})

const renderGraph = WebGlRenderGraph.build(g.getNodes())

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <>
        <Canvas
            onInitialize={canvas => renderGraph.initializeCanvas(canvas)}
            onUpdate={() => {
                valueRotation += 0.02
                if(valueRotation >= 360) valueRotation = 0;
                renderGraph.execute()
            }}
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
        console.log({...resource, dirty: renderGraph.getExecutionContext()?.isDirty(resource.key)})
    }
}