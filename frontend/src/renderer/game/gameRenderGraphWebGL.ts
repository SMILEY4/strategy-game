import {RenderGraph} from "../core/graph/renderGraph";
import {WebGLRenderGraphSorter} from "../core/webgl/webGLRenderGraphSorter";
import {WebGLResourceManager} from "../core/webgl/webGLResourceManager";
import {WebGLRenderGraphCompiler} from "../core/webgl/webGLRenderGraphCompiler";
import {TilesWaterDrawNode} from "./rendernodes/tilesWaterDrawNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {WebGLRenderCommand} from "../core/webgl/webGLRenderCommand";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {Camera} from "../../shared/webgl/camera";
import {TilesLandDrawNode} from "./rendernodes/tilesLandDrawNode";
import {TilesFogDrawNode} from "./rendernodes/tilesFogDrawNode";
import {CombineLayersDrawNode} from "./rendernodes/combineLayersDrawNode";
import {GameShaderSourceManager} from "./shaders/gameShaderSourceManager";
import {VertexFullQuadNode} from "../core/prebuilt/vertexFullquadNode";
import {EntitiesVertexNode} from "./rendernodes/entitiesVertexNode";
import {EntitiesDrawNode} from "./rendernodes/entitiesDrawNode";
import {RoutesDrawNode} from "./rendernodes/routesDrawNode";
import {RoutesVertexNode} from "./rendernodes/routesVertexNode";
import {OverlayDrawNode} from "./rendernodes/overlayDrawNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";
import {DetailsDrawNode} from "./rendernodes/detailsDrawNode";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {RenderRepository} from "./renderRepository";

/**
 * Render graph for webgl-render-nodes
 */
export class GameRenderGraphWebGL extends RenderGraph<WebGLRenderCommand.Context> {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: BaseRenderer;

    private camera: Camera = new Camera();

    constructor(
        changeProvider: ChangeProvider,
        gl: WebGL2RenderingContext,
        renderConfig: () => GameRenderConfig,
        renderRepository: RenderRepository,
    ) {
        super({
            sorter: new WebGLRenderGraphSorter(),
            resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
            compiler: new WebGLRenderGraphCompiler(),
            nodes: [
                new VertexFullQuadNode(),
                new TilesVertexNode(changeProvider, renderConfig, renderRepository),
                new OverlayVertexNode(changeProvider, renderRepository),
                new EntitiesVertexNode(changeProvider),
                new DetailsVertexNode(changeProvider),
                new RoutesVertexNode(changeProvider),
                new TilesWaterDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new TilesLandDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new TilesFogDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new OverlayDrawNode(renderRepository, () => this.camera.getViewProjectionMatrixOrThrow()),
                new EntitiesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DetailsDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new RoutesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new CombineLayersDrawNode(renderRepository, () => this.camera),
            ],
        });
        this.gl = gl;
        this.renderer = new BaseRenderer(this.gl);
    }

    /**
     * Initialize the render graph
     */
    public initialize() {
        super.initialize({
            gl: this.gl,
            renderer: this.renderer,
            camera: this.camera,
        });
    }

    /**
     * Update the camera
     */
    public updateCamera(camera: Camera) {
        this.camera = camera;
        this.updateContext(ctx => ({
            ...ctx,
            camera: this.camera,
        }));
    }

    /**
     * Execute this render graph and "draw" to screen
     */
    public execute() {
        super.execute();
    }
}