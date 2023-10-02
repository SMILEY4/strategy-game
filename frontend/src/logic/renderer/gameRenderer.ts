import {GameRepository} from "../game/gameRepository";
import {WorldRenderer} from "./world/worldRenderer";
import {RenderWorldFactory} from "./world/renderFactory";
import {RenderWorld} from "./world/renderWorld";
import {Camera} from "./common/camera";
import {GLRenderer} from "./common/glRenderer";
import {RenderChunkFactory} from "./world/renderChunkFactory";

export class GameRenderer {

    private readonly gameRepository: GameRepository;

    private gl: WebGL2RenderingContext | null = null;
    private worldRenderer: WorldRenderer | null = null;
    private world: RenderWorld | null = null;


    constructor(gameRepository: GameRepository) {
        this.gameRepository = gameRepository;
    }

    public initialize(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl2");
        if (!gl) {
            throw Error("webgl2 not supported");
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl = gl;
        this.worldRenderer = new WorldRenderer(new GLRenderer(gl));
        this.world = RenderWorldFactory.createWorld(this.gl);
    }

    public updateWorld() {
        if (this.gl) {
            this.world?.getLayers().forEach(layer => {
                layer.getChunks().forEach(chunk => {
                    chunk.dispose();
                });
            });
            this.world?.getLayers()[0].setChunks(RenderChunkFactory.create(
                this.gl,
                this.gameRepository.getTiles(),
                this.world?.getLayers()[0].getShaderAttributes(),
            ));
        }
    }

    private firstFrame = true;

    public render() {
        if (this.world && this.worldRenderer && this.gl) {
            if (this.firstFrame) {
                this.worldRenderer.render(this.world, this.getRenderCamera());
                // this.firstFrame = false;
            }
        }
    }

    public dispose() {
        this.worldRenderer?.dispose();
        this.world?.dispose();
    }

    private getRenderCamera(): Camera {
        const data = this.gameRepository.getCamera();
        const camera = new Camera();
        camera.setPosition(data.x, data.y);
        camera.setZoom(data.zoom);
        camera.updateViewProjectionMatrix(this.gl?.canvas.width!, this.gl?.canvas.height!);
        return camera;
    }

}