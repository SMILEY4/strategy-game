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
import {Command} from "../../models/command/command";
import {GameStateAccess} from "../../state/gameStateAccess";
import {CountrySummary} from "../../models/country/countrySummary";
import {RenderGraphMonitor} from "../common/graph/renderGraphMonitor";

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
	playerCountry: CountrySummary,
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
	private readonly monitor: RenderGraphMonitor;
	private readonly localStateAccess: GameStateAccess;

	private readonly pooledWebGLContext: GameWebGLRenderContext;
	private readonly pooledHtmlContext: GameHtmlRenderContext;

	constructor(
		gl: WebGL2RenderingContext,
		renderer: BaseRenderer,
		monitor: RenderGraphMonitor,
		localStateAccess: GameStateAccess,
	) {
		this.gl = gl;
		this.renderer = renderer;
		this.monitor = monitor;
		this.localStateAccess = localStateAccess;

		this.pooledWebGLContext = {
			gl: this.gl,
			renderer: this.renderer,
			monitor: this.monitor,
			tileByPosProvider: (q, r) => this.localStateAccess.getTileAt(q, r),
			camera: null as any,
			renderConfig: null as any,
			mapMode: null as any,
			timestamp: null as any,
			selectedTile: null as any,
			tiles: null as any,
			settlements: null as any,
			worldObjects: null as any,
			moveTargets: null as any,
			routes: null as any,
		}

		this.pooledHtmlContext = {
			monitor: this.monitor,
			camera: null as any,
			playerCountry: null as any,
			mapMode: null as any,
			commands: null as any,
			tiles: null as any,
			settlements: null as any,
			worldObjects: null as any,
			movePaths: null as any,
		};

	}

	public createWebGLContext(camera: Camera, renderConfig: GameRenderConfig): GameWebGLRenderContext {
		this.pooledWebGLContext.camera = camera
		this.pooledWebGLContext.renderConfig = renderConfig
		this.pooledWebGLContext.mapMode = this.localStateAccess.getMapMode()
		this.pooledWebGLContext.timestamp = (Date.now() / 1000) % 10000
		this.pooledWebGLContext.selectedTile = this.localStateAccess.getSelectedTile()
		this.pooledWebGLContext.tiles = this.localStateAccess.getTiles()
		this.pooledWebGLContext.settlements = this.localStateAccess.getSettlements()
		this.pooledWebGLContext.worldObjects = this.localStateAccess.getWorldObjects()
		this.pooledWebGLContext.moveTargets = this.localStateAccess.getMoveTargets()
		this.pooledWebGLContext.routes = this.localStateAccess.getRoutes()
		return this.pooledWebGLContext;
	}

	public createHtmlContext(camera: Camera): GameHtmlRenderContext {
		this.pooledHtmlContext.camera = camera;
		this.pooledHtmlContext.playerCountry = this.localStateAccess.getPlayerCountrySummary()
		this.pooledHtmlContext.mapMode = this.localStateAccess.getMapMode()
		this.pooledHtmlContext.commands = this.localStateAccess.getCommands()
		this.pooledHtmlContext.tiles = this.localStateAccess.getTiles()
		this.pooledHtmlContext.settlements = this.localStateAccess.getSettlements()
		this.pooledHtmlContext.worldObjects = this.localStateAccess.getWorldObjects()
		this.pooledHtmlContext.movePaths = this.localStateAccess.getMovePaths()
		return this.pooledHtmlContext
	}

}