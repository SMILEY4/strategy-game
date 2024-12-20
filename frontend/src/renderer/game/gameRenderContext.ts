import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {MapMode} from "../../models/base/mapMode";
import {Tile, TileIdentifier} from "../../models/base/tile";
import {Settlement} from "../../models/base/Settlement";
import {MovementTarget} from "../../models/base/movementTarget";
import {Route} from "../../models/base/route";
import {GameRenderConfig} from "./gameRenderConfig";
import {TileRepository} from "../../state/repository/tileRepository";
import {HtmlRenderCommand} from "../common/html/htmlRenderCommand";
import {Camera} from "../../common/webgl/camera";
import {TilePosition} from "../../models/base/tilePosition";
import {WorldObject} from "../../models/base/worldObject";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";
import {RouteRepository} from "../../state/repository/routeRepository";
import {BaseRenderer} from "../../common/webgl/baseRenderer";

export interface GameWebGLRenderContext extends WebGLRenderCommand.Context {
	timestamp: number,
	renderConfig: GameRenderConfig,
	mapMode: MapMode,
	selectedTile: TileIdentifier | null,
	settlements: Settlement[],
	tiles: Tile[],
	movementTargets: MovementTarget[],
	routes: Route[],
	tileByPosProvider: (q: number, r: number) => Tile | null
}

export interface GameHtmlRenderContext extends HtmlRenderCommand.Context {
	camera: Camera,
	mapMode: MapMode,
	tiles: Tile[],
	settlements: Settlement[],
	worldObjects: WorldObject[]
	movementPaths: { positions: TilePosition[], pending: boolean }[],
}


export class RenderContextFactory {

	private readonly gl: WebGL2RenderingContext;
	private readonly renderer: BaseRenderer;
	private readonly tileRepository: TileRepository;
	private readonly sessionRepository: SessionRepository;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly settlementRepository: SettlementRepository;
	private readonly routeRepository: RouteRepository;

	private tileCache: { items: Tile[], revId: string } = {items: [], revId: ""};
	private settlementCache: { items: Settlement[], revId: string } = {items: [], revId: ""};
	private worldObjectCache: { items: WorldObject[], revId: string } = {items: [], revId: ""};
	private routeCache: { items: Route[], revId: string } = {items: [], revId: ""};

	constructor(gl: WebGL2RenderingContext, renderer: BaseRenderer, tileRepository: TileRepository, sessionRepository: SessionRepository, worldObjectRepository: WorldObjectRepository, settlementRepository: SettlementRepository, routeRepository: RouteRepository) {
		this.gl = gl;
		this.renderer = renderer;
		this.tileRepository = tileRepository;
		this.sessionRepository = sessionRepository;
		this.worldObjectRepository = worldObjectRepository;
		this.settlementRepository = settlementRepository;
		this.routeRepository = routeRepository;
	}

	public createWebGLContext(camera: Camera, renderConfig: GameRenderConfig): GameWebGLRenderContext {
		return {
			gl: this.gl,
			renderer: this.renderer,
			camera: camera,
			renderConfig: renderConfig,
			mapMode: this.sessionRepository.getMapMode(),
			timestamp: (Date.now() / 1000) % 10000,
			selectedTile: this.tileRepository.getSelected(),
			settlements: this.getSettlementsAll(),
			tiles: this.getTilesAll(),
			movementTargets: this.worldObjectRepository.getMovementTargets(),
			routes: this.getRoutesAll(),
			tileByPosProvider: (q, r) => this.tileRepository.getAt(q, r)
		};
	}

	public createHtmlContext(camera: Camera): GameHtmlRenderContext {
		return {
			camera: camera,
			mapMode: this.sessionRepository.getMapMode(),
			tiles: this.getTilesAll(),
			settlements: this.getSettlementsAll(),
			worldObjects: this.getWorldObjectsAll(),
			movementPaths: this.worldObjectRepository.getMovementPaths(),
		};
	}

	private getTilesAll(): Tile[] {
		if (this.tileCache.revId !== this.tileRepository.getTilesRevId()) {
			this.tileCache.items= this.tileRepository.getAll();
			this.tileCache.revId = this.tileRepository.getTilesRevId();
		}
		return this.tileCache.items;
	}

	private getSettlementsAll(): Settlement[] {
		if (this.settlementCache.revId !== this.settlementRepository.getSettlementsRevId()) {
			this.settlementCache.items = this.settlementRepository.getAll();
			this.settlementCache.revId = this.settlementRepository.getSettlementsRevId();
		}
		return this.settlementCache.items;
	}

	private getWorldObjectsAll(): WorldObject[] {
		if (this.worldObjectCache.revId !== this.worldObjectRepository.getWorldObjectsRevId()) {
			this.worldObjectCache.items = this.worldObjectRepository.getAll();
			this.worldObjectCache.revId = this.worldObjectRepository.getWorldObjectsRevId();
		}
		return this.worldObjectCache.items;
	}

	private getRoutesAll(): Route[] {
		if (this.routeCache.revId !== this.routeRepository.getRoutesRevId()) {
			this.routeCache.items = this.routeRepository.getAll();
			this.routeCache.revId = this.routeRepository.getRoutesRevId();
		}
		return this.routeCache.items;
	}

}