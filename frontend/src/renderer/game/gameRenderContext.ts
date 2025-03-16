import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {MapMode} from "../../models/misc/mapMode";
import {GameRenderConfig} from "./gameRenderConfig";
import {HtmlRenderCommand} from "../common/html/htmlRenderCommand";
import {Camera} from "../../common/webgl/camera";
import {BaseRenderer} from "../../common/webgl/baseRenderer";
import {TileSummary} from "../../models/tile/tileSummary";
import {Tile} from "../../models/tile/tile";
import {Settlement} from "../../models/settlement/settlement";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Route} from "../../models/route/route";
import {Country} from "../../models/country/country";
import {Command} from "../../models/command/command";
import {GameStateAccess} from "../../state/gameStateAccess";

export interface GameWebGLRenderContext extends WebGLRenderCommand.Context {
	timestamp: number,
	renderConfig: GameRenderConfig,
	mapMode: MapMode,
	selectedTile: TileSummary | null,
	tiles: Tile[],
	settlements: Settlement[],
	worldObjects: WorldObject[]
	moveTargets: TileSummary[],
	routes: Route[],
	tileByPosProvider: (q: number, r: number) => Tile | null
}

export interface GameHtmlRenderContext extends HtmlRenderCommand.Context {
	playerCountry: Country,
	camera: Camera,
	mapMode: MapMode,
	tiles: Tile[],
	settlements: Settlement[],
	commands: Command[],
	worldObjects: WorldObject[]
	movePaths: ({ tiles: TileSummary[], pending: boolean })[],
}


export class RenderContextFactory {

	private readonly gl: WebGL2RenderingContext;
	private readonly renderer: BaseRenderer;
	private readonly localStateAccess: GameStateAccess;

	constructor(
		gl: WebGL2RenderingContext,
		renderer: BaseRenderer,
		localStateAccess: GameStateAccess,
	) {
		this.gl = gl;
		this.renderer = renderer;
		this.localStateAccess = localStateAccess;
	}

	public createWebGLContext(camera: Camera, renderConfig: GameRenderConfig): GameWebGLRenderContext {
		return {
			gl: this.gl,
			renderer: this.renderer,
			camera: camera,
			renderConfig: renderConfig,
			mapMode: this.localStateAccess.getMapMode(),
			timestamp: (Date.now() / 1000) % 10000,
			selectedTile: this.localStateAccess.getSelectedTile(),
			tiles: this.localStateAccess.getTiles(),
			settlements: this.localStateAccess.getSettlements(),
			worldObjects: this.localStateAccess.getWorldObjects(),
			moveTargets: this.localStateAccess.getMoveTargets(),
			routes: this.localStateAccess.getRoutes(),
			tileByPosProvider: (q, r) => this.localStateAccess.getTileAt(q, r),
		};
	}

	public createHtmlContext(camera: Camera): GameHtmlRenderContext {
		return {
			playerCountry: this.localStateAccess.getPlayerCountry(),
			camera: camera,
			mapMode: this.localStateAccess.getMapMode(),
			commands: this.localStateAccess.getCommands(),
			tiles: this.localStateAccess.getTiles(),
			settlements: this.localStateAccess.getSettlements(),
			worldObjects: this.localStateAccess.getWorldObjects(),
			movePaths: this.localStateAccess.getMovePaths(),
		};
	}

}