import {GLRenderer} from "../../common/glRenderer";
import {Camera} from "../../common/camera";
import {GLProgram} from "../../common/glProgram";
import GLProgramAttribute = GLProgram.GLProgramAttribute;

export abstract class BaseRenderLayer {

    private readonly layerId: number;

    constructor(layerId: number) {
        this.layerId = layerId;
    }

    public getLayerId(): number {
        return this.layerId;
    }

    abstract render(camera: Camera, renderer: GLRenderer): void;

    abstract getShaderAttributes(): GLProgramAttribute[]

    abstract dispose(): void;

    abstract disposeWorldData(): void;

}