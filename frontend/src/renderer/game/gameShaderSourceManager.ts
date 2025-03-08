import {WebGLShaderSourceManager} from "../common/webgl/webGLShaderSourceManager";
import {DrawRenderTargetToScreenNode} from "../common/prebuilt/drawRenderTargetToScreenNode";

import SHADER_COMMON_COLOR from "./shaders/common/color.glsl?raw";
import SHADER_COMMON_MAP from "./shaders/common/map.glsl?raw";
import SHADER_COMMON_BORDER from "./shaders/common/border.glsl?raw";
import SHADER_COMMON_RANDOM from "./shaders/common/random.glsl?raw";
import SHADER_COMMON_LUT from "./shaders/common/lut.glsl?raw";

import SHADER_WATER_VERT from "./shaders/water.vsh?raw";
import SHADER_WATER_FRAG from "./shaders/water.fsh?raw";
import SHADER_LAND_VERT from "./shaders/land.vsh?raw";
import SHADER_LAND_FRAG from "./shaders/land.fsh?raw";
import SHADER_FOG_VERT from "./shaders/fog.vsh?raw";
import SHADER_FOG_FRAG from "./shaders/fog.fsh?raw";
import SHADER_COMBINE_VERT from "./shaders/combine.vsh?raw";
import SHADER_COMBINE_FRAG from "./shaders/combine.fsh?raw";
import SHADER_MAPDETAILS_VERT from "./shaders/mapdetails.vsh?raw";
import SHADER_MAPDETAILS_FRAG from "./shaders/mapdetails.fsh?raw";
import SHADER_OVERLAY_VERT from "./shaders/overlay.vsh?raw";
import SHADER_OVERLAY_FRAG from "./shaders/overlay.fsh?raw";
import SHADER_RT2SCREEN_VERT from "../common/prebuilt/rendertarget2screen.vsh?raw";
import SHADER_RT2SCREEN_FRAG from "../common/prebuilt/rendertarget2screen.fsh?raw";

export class GameShaderSourceManager extends WebGLShaderSourceManager {


	constructor() {
		super();

		this.register("color", SHADER_COMMON_COLOR);
		this.register("map", SHADER_COMMON_MAP);
		this.register("border", SHADER_COMMON_BORDER);
		this.register("random", SHADER_COMMON_RANDOM);
		this.register("lut", SHADER_COMMON_LUT);

		this.register("water.vert", SHADER_WATER_VERT);
		this.register("water.frag", SHADER_WATER_FRAG);

		this.register("land.vert", SHADER_LAND_VERT);
		this.register("land.frag", SHADER_LAND_FRAG);

		this.register("fog.vert", SHADER_FOG_VERT);
		this.register("fog.frag", SHADER_FOG_FRAG);

		this.register("mapdetails.vert", SHADER_MAPDETAILS_VERT);
		this.register("mapdetails.frag", SHADER_MAPDETAILS_FRAG);

		this.register("overlay.vert", SHADER_OVERLAY_VERT);
		this.register("overlay.frag", SHADER_OVERLAY_FRAG);

		this.register("combine.vert", SHADER_COMBINE_VERT);
		this.register("combine.frag", SHADER_COMBINE_FRAG);

		this.register(DrawRenderTargetToScreenNode.SHADER_ID_VERTEX, SHADER_RT2SCREEN_VERT);
		this.register(DrawRenderTargetToScreenNode.SHADER_ID_FRAGMENT, SHADER_RT2SCREEN_FRAG);

		this.process();
	}
}