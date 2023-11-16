import {CanvasHandle} from "../../logic/game/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class TilemapRenderer implements RenderModule {

    private static readonly TILE_POS_NONE = [9999, 9999];

    private readonly canvasHandle: CanvasHandle;
    private renderer: GLRenderer = null as any;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
        this.renderer = new GLRenderer(this.canvasHandle.getGL());
    }


    public render(camera: Camera, data: RenderData) {

        data.tilemap.textures.tileset.bind(0);
        data.tilemap.textures.texturePaper.bind(1);
        data.tilemap.textures.textureClouds.bind(2);
        data.entityMask.framebuffer.bindTexture(3);

        data.tilemap.program.use();
        data.tilemap.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.tilemap.program.setUniform("u_zoom", GLUniformType.FLOAT, camera.getZoom());
        data.tilemap.program.setUniform("u_screenSize", GLUniformType.VEC2, [camera.getWidth(), camera.getHeight()]);
        data.tilemap.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, data.game.tileSelected ? data.game.tileSelected : TilemapRenderer.TILE_POS_NONE);
        data.tilemap.program.setUniform("u_mouseOverTile", GLUniformType.INT_VEC2, data.game.tileMouseOver ? data.game.tileMouseOver : TilemapRenderer.TILE_POS_NONE);
        data.tilemap.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.tilemap.textures.tileset);
        data.tilemap.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, data.tilemap.textures.texturePaper);
        data.tilemap.program.setUniform("u_noise", GLUniformType.SAMPLER_2D, data.tilemap.textures.textureClouds);
        data.tilemap.program.setUniform("u_entityMask", GLUniformType.SAMPLER_2D, data.entityMask.framebuffer);

        data.tilemap.vertexArray.bind();
        this.renderer.drawInstanced(data.tilemap.mesh.vertexCount, data.tilemap.instances.instanceCount);
        data.tilemap.vertexArray.unbind();
    }


    public dispose() {
    }


}