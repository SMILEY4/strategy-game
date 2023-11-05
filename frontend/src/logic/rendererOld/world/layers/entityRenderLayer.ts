import {GLRenderer} from "../../../../shared/webgl/glRenderer";
import {Camera} from "../../../../shared/webgl/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../../../../shared/webgl/glProgram";
import {MeshData} from "../data/meshData";
import {GLUniformType} from "../../../../shared/webgl/glTypes";
import {GLTexture} from "../../../../shared/webgl/glTexture";
import {TextRenderer} from "../../../../shared/webgl/textRenderer";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export class EntityRenderLayer extends BaseRenderLayer {

    public static readonly LAYER_ID = 1;

    private readonly program: GLProgram;
    private readonly texture: GLTexture;
    private readonly textRenderer: TextRenderer;
    private mesh: MeshData | null = null;

    constructor(program: GLProgram, texture: GLTexture, textRenderer: TextRenderer) {
        super(EntityRenderLayer.LAYER_ID);
        this.program = program;
        this.texture = texture;
        this.textRenderer = textRenderer;
    }

    public setMesh(mesh: MeshData) {
        this.mesh = mesh;
    }

    public render(camera: Camera, renderer: GLRenderer): void {
        if (this.mesh) {

            this.texture.bind(0);
            this.textRenderer.getTexture()?.bind(1)
            this.program.use();

            this.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
            this.program.setUniform("u_textureIcons", GLUniformType.SAMPLER_2D, this.texture);
            this.program.setUniform("u_textureLabels", GLUniformType.SAMPLER_2D, this.textRenderer.getTexture()!!);

            this.mesh.getVertexArray().bind();
            renderer.drawIndexed(this.mesh.getAmountIndices());

        }
    }

    public getShaderAttributes(): GLProgramAttribute[] {
        return this.program.getInformation().attributes;
    }

    public getTextRenderer(): TextRenderer {
        return this.textRenderer;
    }

    public dispose(): void {
        this.program.dispose();
    }

    public disposeWorldData(): void {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }

}