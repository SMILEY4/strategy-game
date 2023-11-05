import {GLRenderer} from "../../../../shared/webgl/glRenderer";
import {Camera} from "../../../../shared/webgl/camera";
import {GLProgram} from "../../../../shared/webgl/glProgram";
import GLProgramAttribute = GLProgram.GLProgramAttribute;
import {MapMode} from "../../../../models/mapMode";

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