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
import {VertexEntitiesNode} from "./rendernodes/vertexEntitiesNode";
import {DrawEntitiesNode} from "./rendernodes/drawEntitiesNode";
import {DrawRoutesNode} from "./rendernodes/drawRoutesNode";
import {VertexRoutesNode} from "./rendernodes/vertexRoutesNode";
import {RouteDatabase} from "../../state/routeDatabase";
import {DrawTilesOverlayNode} from "./rendernodes/drawTilesOverlayNode";
import {VertexOverlayNode} from "./rendernodes/vertexOverlayNode";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {VertexDetailsNode} from "./rendernodes/vertexDetailsNode";
import {DrawDetailsNode} from "./rendernodes/drawDetailsNode";
import {CommandDatabase} from "../../state/commandDatabase";
import {DrawRenderTargetToScreenNode} from "../core/prebuiltnodes/drawRenderTargetToScreenNode";
import {GameRenderConfig} from "./gameRenderConfig";


export class GameRenderGraph extends RenderGraph<WebGLRenderCommand.Context> {

    private readonly gl: WebGL2RenderingContext;
    private readonly renderer: BaseRenderer;

    private camera: Camera = new Camera();

    constructor(
        gl: WebGL2RenderingContext,
        renderConfig: () => GameRenderConfig,
        tileDb: TileDatabase,
        routeDb: RouteDatabase,
        gameSessionDb: GameSessionDatabase,
        commandDb: CommandDatabase,
    ) {
        super({
            sorter: new WebGLRenderGraphSorter(),
            resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
            compiler: new WebGLRenderGraphCompiler(),
            nodes: [
                // common
                new VertexFullQuadNode(),
                // game
                new VertexTilesNode(renderConfig, tileDb),
                new VertexOverlayNode(tileDb, gameSessionDb),
                new VertexEntitiesNode(tileDb, commandDb),
                new VertexDetailsNode(tileDb),
                new VertexRoutesNode(routeDb),
                new DrawTilesWaterNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawTilesLandNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawTilesFogNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawTilesOverlayNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawEntitiesNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawDetailsNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawRoutesNode(() => this.camera.getViewProjectionMatrixOrThrow()),
                new DrawCombineLayersNode(),
                // debug
                // new DrawRenderTargetToScreenNode("rendertarget.tilesland")
            ],
        });
        this.gl = gl;
        this.renderer = new BaseRenderer(this.gl);
    }

    public initialize() {
        super.initialize({
            gl: this.gl,
            renderer: this.renderer,
            camera: this.camera,
        });
    }

    public updateCamera(camera: Camera) {
        this.camera = camera;
        this.updateContext(ctx => ({
            ...ctx,
            camera: this.camera,
        }));
    }

    public execute() {
        super.execute();
    }
}