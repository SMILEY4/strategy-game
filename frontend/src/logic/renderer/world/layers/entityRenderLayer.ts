import {GLRenderer} from "../../common/glRenderer";
import {Camera} from "../../common/camera";
import {BaseRenderLayer} from "./baseRenderLayer";
import {GLProgram} from "../../common/glProgram";
import {MeshData} from "../data/meshData";
import {GLUniformType} from "../../common/glTypes";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import {GLTexture} from "../../common/glTexture";

export class EntityRenderLayer extends BaseRenderLayer {

    public static readonly LAYER_ID = 1;

    private readonly program: GLProgram;
    private readonly texture: GLTexture;
    private mesh: MeshData | null = null;

    constructor(program: GLProgram, texture: GLTexture) {
        super(EntityRenderLayer.LAYER_ID);
        this.program = program;
        this.texture = texture;
    }

    public setMesh(mesh: MeshData) {
        this.mesh = mesh;
    }

    public render(camera: Camera, renderer: GLRenderer): void {
        if (this.mesh) {

            this.texture.bind(0)
            this.program.use();

            this.program.setUniform("u_viewProjection", GLUniformType.MAT3, camera.getViewProjectionMatrixOrThrow());
            this.program.setUniform("u_texture", GLUniformType.SAMPLER_2D, this.texture);

            this.mesh.getVertexArray().bind();
            renderer.drawMesh(this.mesh.getAmountIndices());

        }
    }

    public getShaderAttributes(): GLProgramAttribute[] {
        return this.program.getInformation().attributes;
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