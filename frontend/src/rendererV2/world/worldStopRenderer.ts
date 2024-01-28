import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {RenderModule} from "../renderModule";
import {RenderData} from "../data/renderData";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {GLUniformType} from "../../shared/webgl/glTypes";

export class WorldStopRenderer implements RenderModule {

    private readonly canvasHandle: CanvasHandle;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }


    public initialize(): void {
    }


    public render(camera: Camera, data: RenderData) {
        data.world.framebuffer.unbind()
    }


    public dispose() {
    }


}