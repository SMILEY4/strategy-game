import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {MapMode} from "../../models/base/mapMode";
import {TileIdentifier} from "../../models/base/tile";

export interface GameWebGLRenderContext extends WebGLRenderCommand.Context {
	timestamp: number,
	mapMode: MapMode,
	selectedTile: TileIdentifier | null
}