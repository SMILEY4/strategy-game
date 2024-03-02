import {WebGLShaderSourceManager} from "../../core/webgl/webGLShaderSourceManager";
import {DrawRenderTargetToScreenNode} from "../../core/prebuiltnodes/drawRenderTargetToScreenNode";

import SHADER_WATER_VERT from "./water.vsh?raw";
import SHADER_WATER_FRAG from "./water.fsh?raw";
import SHADER_LAND_VERT from "./land.vsh?raw";
import SHADER_LAND_FRAG from "./land.fsh?raw";
import SHADER_FOG_VERT from "./fog.vsh?raw";
import SHADER_FOG_FRAG from "./fog.fsh?raw";
import SHADER_COMBINE_VERT from "./combine.vsh?raw";
import SHADER_COMBINE_FRAG from "./combine.fsh?raw";
import SHADER_ENTITIES_VERT from "./entities.vsh?raw";
import SHADER_ENTITIES_FRAG from "./entities.fsh?raw";
import SHADER_DETAILS_VERT from "./entities.vsh?raw";
import SHADER_DETAILS_FRAG from "./entities.fsh?raw";
import SHADER_ROUTES_VERT from "./routes.vsh?raw";
import SHADER_ROUTES_FRAG from "./routes.fsh?raw";
import SHADER_OVERLAY_VERT from "./overlay.vsh?raw";
import SHADER_OVERLAY_FRAG from "./overlay.fsh?raw";
import SHADER_RT2SCREEN_VERT from "../../core/prebuiltnodes/rendertarget2screen.vsh?raw";
import SHADER_RT2SCREEN_FRAG from "../../core/prebuiltnodes/rendertarget2screen.fsh?raw";

export class GameShaderSourceManager extends WebGLShaderSourceManager {


    constructor() {
        super();

        this.register("water.vert", SHADER_WATER_VERT)
        this.register("water.frag", SHADER_WATER_FRAG)

        this.register("land.vert", SHADER_LAND_VERT)
        this.register("land.frag", SHADER_LAND_FRAG)

        this.register("fog.vert", SHADER_FOG_VERT)
        this.register("fog.frag", SHADER_FOG_FRAG)

        this.register("entities.vert", SHADER_ENTITIES_VERT)
        this.register("entities.frag", SHADER_ENTITIES_FRAG)

        this.register("details.vert", SHADER_DETAILS_VERT)
        this.register("details.frag", SHADER_DETAILS_FRAG)

        this.register("routes.vert", SHADER_ROUTES_VERT)
        this.register("routes.frag", SHADER_ROUTES_FRAG)

        this.register("overlay.vert", SHADER_OVERLAY_VERT)
        this.register("overlay.frag", SHADER_OVERLAY_FRAG)

        this.register("combine.vert", SHADER_COMBINE_VERT)
        this.register("combine.frag", SHADER_COMBINE_FRAG)


        this.register(DrawRenderTargetToScreenNode.SHADER_ID_VERTEX, SHADER_RT2SCREEN_VERT)
        this.register(DrawRenderTargetToScreenNode.SHADER_ID_FRAGMENT, SHADER_RT2SCREEN_FRAG)
    }
}