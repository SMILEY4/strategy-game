import {WebGLShaderSourceManager} from "../../core/webgl/webGLShaderSourceManager";
import {DrawRenderTargetToScreenNode} from "../../core/prebuiltnodes/drawRenderTargetToScreenNode";

import SHADER_WATER_VERT from "./water.vsh?raw";
import SHADER_WATER_FRAG from "./water.fsh?raw";
import SHADER_RT2SCREEN_VERT from "../../core/prebuiltnodes/rendertarget2screen.vsh?raw";
import SHADER_RT2SCREEN_FRAG from "../../core/prebuiltnodes/rendertarget2screen.fsh?raw";

export class GameShaderSourceManager extends WebGLShaderSourceManager {


    constructor() {
        super();

        this.register("water.vert", SHADER_WATER_VERT)
        this.register("water.frag", SHADER_WATER_FRAG)

        this.register(DrawRenderTargetToScreenNode.SHADER_ID_VERTEX, SHADER_RT2SCREEN_VERT)
        this.register(DrawRenderTargetToScreenNode.SHADER_ID_FRAGMENT, SHADER_RT2SCREEN_FRAG)
    }
}