import {GameRenderGraph} from "./gameRenderGraph";
import {WebGlRenderGraphCompiler} from "../core/webgl/webglRenderGraphCompiler";
import {WebGlResourceManager} from "../core/webgl/webglResourceManager";
import {FullQuadVertexGenerator} from "./vertexDataGenerators/fullQuadVertexGenerator";

export class GameRenderer {

    private readonly renderGraph;

    constructor(gl: WebGL2RenderingContext) {
        this.renderGraph = new GameRenderGraph();
        this.renderGraph.compile(new WebGlRenderGraphCompiler(), new WebGlResourceManager(gl, {
            shaderSources: [
                {
                    name: "vertex.fullquad",
                    source: "...",
                },
                {
                    name: "fragment.combine",
                    source: "...",
                },
            ],
            vertexData: [
                {
                    name: "vertex.fullscreen",
                    generator: new FullQuadVertexGenerator(),
                },
            ],
        }));
    }


    public render() {
        // this.renderGraph.execute();
    }
}