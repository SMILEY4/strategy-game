import {RenderGraph} from "../core/graph/renderGraph";
import {WebGLRenderGraphSorter} from "../core/webgl/webGLRenderGraphSorter";
import {WebGLResourceManager} from "../core/webgl/webGLResourceManager";
import {WebGLRenderGraphCompiler} from "../core/webgl/webGLRenderGraphCompiler";
import {DrawTilesWaterNode} from "./rendernodes/drawTilesWaterNode";
import {VertexTilesNode} from "./rendernodes/vertexTilesNode";
import {WebGLRenderCommand} from "../core/webgl/webGLRenderCommand";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {Camera} from "../../shared/webgl/camera";
import {TileDatabase} from "../../state/tileDatabase";
import {DrawTilesLandNode} from "./rendernodes/drawTilesLandNode";
import {DrawTilesFogNode} from "./rendernodes/drawTilesFogNode";
import {DrawCombineLayersNode} from "./rendernodes/drawCombineLayersNode";
import {GameShaderSourceManager} from "./shaders/gameShaderSourceManager";
import {VertexFullQuadNode} from "../core/prebuiltnodes/vertexFullquadNode";
import {DrawRenderTargetToScreenNode} from "../core/prebuiltnodes/drawRenderTargetToScreenNode";


export class GameRenderGraph extends RenderGraph<WebGLRenderCommand.Context> {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: BaseRenderer;

    private camera: Camera = new Camera();

    constructor(gl: WebGL2RenderingContext, tileDb: TileDatabase) {
        super({
            sorter: new WebGLRenderGraphSorter(),
            resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
            compiler: new WebGLRenderGraphCompiler(),
            nodes: [
                // game
                new VertexTilesNode(tileDb),
                new DrawTilesWaterNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                // debug
                new VertexFullQuadNode(),
                new DrawRenderTargetToScreenNode("rendertarget.tileswater")
            ],
        });
        this.gl = gl;
        this.renderer = new BaseRenderer(this.gl);
    }

    public initialize() {
        super.initialize({
            gl: this.gl,
            renderer: this.renderer,
            camera: this.camera
        });
    }

    public updateCamera(camera: Camera) {
        this.camera = camera;
        this.updateContext(ctx => ({
            ...ctx,
            camera: this.camera
        }))
    }

    public execute() {
        super.execute();
    }
}