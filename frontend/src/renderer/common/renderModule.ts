import {Camera} from "../../shared/webgl/camera";

export interface RenderModule {
    initialize: () => void,
    render: (camera: Camera) => void,
    dispose: () => void
}