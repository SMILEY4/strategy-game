import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {MapMode} from "../../models/misc/mapMode";
import {MovementTarget} from "../../models/misc/movementTarget";
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
import {LocalStateAccess} from "../../state/localStateAccess";

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
	movePaths: ({tiles: TileSummary[], pending: boolean})[],
}


export class RenderContextFactory {

	private readonly gl: WebGL2RenderingContext;
	private readonly renderer: BaseRenderer;
	private readonly localStateAccess: LocalStateAccess;

	private tileCache: { items: Tile[], revId: string } = {items: [], revId: ""};
	private settlementCache: { items: Settlement[], revId: string } = {items: [], revId: ""};
	private worldObjectCache: { items: WorldObject[], revId: string } = {items: [], revId: ""};
	private routeCache: { items: Route[], revId: string } = {items: [], revId: ""};

	constructor(
		gl: WebGL2RenderingContext,
		renderer: BaseRenderer,
		localStateAccess: LocalStateAccess,
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
			tiles: this.getTilesAll(),
			settlements: this.getSettlementsAll(),
			worldObjects: this.getWorldObjectsAll(),
			moveTargets: this.localStateAccess.getMoveTargets(),
			routes: this.getRoutesAll(),
			tileByPosProvider: (q, r) => this.localStateAccess.getTileAt(q, r)
		};
	}

	public createHtmlContext(camera: Camera): GameHtmlRenderContext {
		return {
			playerCountry: this.localStateAccess.getPlayerCountry(),
			camera: camera,
			mapMode: this.localStateAccess.getMapMode(),
			commands: this.localStateAccess.getCommands(),
			tiles: this.getTilesAll(),
			settlements: this.getSettlementsAll(),
			worldObjects: this.getWorldObjectsAll(),
			movePaths: this.localStateAccess.getMovePaths(),
		};
	}

	private getTilesAll(): Tile[] {
		if (this.tileCache.revId !== this.localStateAccess.getTilesRevId()) {
			this.tileCache.items= this.localStateAccess.getTiles();
			this.tileCache.revId = this.localStateAccess.getTilesRevId();
		}
		return this.tileCache.items;
	}

	private getSettlementsAll(): Settlement[] {
		if (this.settlementCache.revId !== this.localStateAccess.getSettlementsRevId()) {
			this.settlementCache.items = this.localStateAccess.getSettlements();
			this.settlementCache.revId = this.localStateAccess.getSettlementsRevId();
		}
		return this.settlementCache.items;
	}

	private getWorldObjectsAll(): WorldObject[] {
		if (this.worldObjectCache.revId !== this.localStateAccess.getWorldObjectsRevId()) {
			this.worldObjectCache.items = this.localStateAccess.getWorldObjects();
			this.worldObjectCache.revId = this.localStateAccess.getWorldObjectsRevId();
		}
		return this.worldObjectCache.items;
	}

	private getRoutesAll(): Route[] {
		if (this.routeCache.revId !== this.localStateAccess.getRoutesRevId()) {
			this.routeCache.items = this.localStateAccess.getRoutes();
			this.routeCache.revId = this.localStateAccess.getRoutesRevId();
		}
		return this.routeCache.items;
	}

}