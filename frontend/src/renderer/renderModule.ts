import {Camera} from "../shared/webgl/camera";
import {RenderData} from "./data/renderData";

export interface RenderModule {
    initialize: () => void,
    render: (camera: Camera, data: RenderData) => void,
    dispose: () => void
}