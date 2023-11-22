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
        data.routes.framebuffer.bindTexture(4);

        data.tilemap.program.use();

        data.tilemap.program.setUniform("u_grayscaleMode", GLUniformType.BOOL, data.meta.grayscale);

        data.tilemap.program.setUniform("u_baseTextureData.scalePaper", GLUniformType.FLOAT, 90);
        data.tilemap.program.setUniform("u_baseTextureData.scaleClouds", GLUniformType.FLOAT, 200);

        data.tilemap.program.setUniform("u_baseTextureData.strengthPaper", GLUniformType.FLOAT, 1);
        data.tilemap.program.setUniform("u_baseTextureData.strengthClouds", GLUniformType.FLOAT, 0.5);

        data.tilemap.program.setUniform("u_baseTextureData.colorLight", GLUniformType.VEC3, [0.88, 0.75, 0.66]);
        data.tilemap.program.setUniform("u_baseTextureData.colorDark", GLUniformType.VEC3, [0.99, 0.75, 0.58]);

        data.tilemap.program.setUniform("u_terrainTilesetData.totalTileCount", GLUniformType.FLOAT, 4);
        data.tilemap.program.setUniform("u_terrainTilesetData.slotSize", GLUniformType.FLOAT, 600);
        data.tilemap.program.setUniform("u_terrainTilesetData.gapSize", GLUniformType.FLOAT, 10);

        data.tilemap.program.setUniform("u_oceanWaveData.thickness", GLUniformType.FLOAT, 0.2);
        data.tilemap.program.setUniform("u_oceanWaveData.waveScale", GLUniformType.FLOAT, 20);
        data.tilemap.program.setUniform("u_oceanWaveData.waveTimeScale", GLUniformType.FLOAT, 0.0125);
        data.tilemap.program.setUniform("u_oceanWaveData.waveStrength", GLUniformType.FLOAT, 0.15);

        data.tilemap.program.setUniform("u_overlayData.borderThickness", GLUniformType.FLOAT, 0.15);
        data.tilemap.program.setUniform("u_overlayData.fillStrength", GLUniformType.FLOAT, 0.6);
        data.tilemap.program.setUniform("u_overlayData.saturationShift", GLUniformType.FLOAT, 0.3);

        data.tilemap.program.setUniform("u_tileBorderData.color", GLUniformType.VEC4, [0, 0, 0, 0.6]);
        data.tilemap.program.setUniform("u_tileBorderData.zoomThreshold", GLUniformType.FLOAT, 3.5);
        data.tilemap.program.setUniform("u_tileBorderData.zoomMax", GLUniformType.FLOAT, 10);
        data.tilemap.program.setUniform("u_tileBorderData.minThickness", GLUniformType.FLOAT, 0.015);
        data.tilemap.program.setUniform("u_tileBorderData.maxThickness", GLUniformType.FLOAT, 0.025);

        data.tilemap.program.setUniform("u_foWData.strengthUnknown", GLUniformType.FLOAT, 0.2);
        data.tilemap.program.setUniform("u_foWData.strengthDiscovered", GLUniformType.FLOAT, 0.5);
        data.tilemap.program.setUniform("u_foWData.strengthVisible", GLUniformType.FLOAT, 1.0);

        data.tilemap.program.setUniform("u_time", GLUniformType.FLOAT, data.meta.time);
        data.tilemap.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
        data.tilemap.program.setUniform("u_zoom", GLUniformType.FLOAT, camera.getZoom());
        data.tilemap.program.setUniform("u_screenSize", GLUniformType.VEC2, [camera.getWidth(), camera.getHeight()]);

        data.tilemap.program.setUniform("u_selectionData.color", GLUniformType.VEC4, [1, 1, 0, 0.75]);
        data.tilemap.program.setUniform("u_selectionData.thickness", GLUniformType.FLOAT, 0.15);

        data.tilemap.program.setUniform("u_mouseOverData.color", GLUniformType.VEC4, [0.8, 0.8, 0.1, 0.75]);
        data.tilemap.program.setUniform("u_mouseOverData.thickness", GLUniformType.FLOAT, 0.08);


        data.tilemap.program.setUniform("u_selectedTile", GLUniformType.INT_VEC2, data.meta.tileSelected ? data.meta.tileSelected : TilemapRenderer.TILE_POS_NONE);
        data.tilemap.program.setUniform("u_mouseOverTile", GLUniformType.INT_VEC2, data.meta.tileMouseOver ? data.meta.tileMouseOver : TilemapRenderer.TILE_POS_NONE);

        data.tilemap.program.setUniform("u_tileset", GLUniformType.SAMPLER_2D, data.tilemap.textures.tileset);
        data.tilemap.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, data.tilemap.textures.texturePaper);
        data.tilemap.program.setUniform("u_noise", GLUniformType.SAMPLER_2D, data.tilemap.textures.textureClouds);
        data.tilemap.program.setUniform("u_entityMask", GLUniformType.SAMPLER_2D, data.entityMask.framebuffer);
        data.tilemap.program.setUniform("u_routes", GLUniformType.SAMPLER_2D, data.routes.framebuffer);

        data.tilemap.vertexArray.bind();
        this.renderer.drawInstanced(data.tilemap.mesh.vertexCount, data.tilemap.instances.instanceCount);
        data.tilemap.vertexArray.unbind();
    }


    public dispose() {
    }


}