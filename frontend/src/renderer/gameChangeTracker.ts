import {GameStateAccess} from "../state/gameStateAccess";
import {Camera} from "../common/webgl/camera";
import {ChangeDetector} from "../common/changeDetector";

export interface TrackedChanges {
	isInitFrame: boolean;
	turn: boolean,
	tiles: boolean,
	settlements: boolean,
	worldObjects: boolean,
	routes: boolean
	commands: boolean,
	mapMode: boolean,
	camera: boolean,
	movementPaths: boolean,
	movementTargets: boolean,
	selectedTile: boolean,
}

export class GameChangeTracker {

	private readonly localStateAccess: GameStateAccess;

	private frameCounter: number = 0;
	private trackedChanges: TrackedChanges = null as any;

	private readonly trackerTurn = new ChangeDetector();
	private readonly trackerTiles = new ChangeDetector();
	private readonly trackerSettlements = new ChangeDetector();
	private readonly trackerWorldObjects = new ChangeDetector();
	private readonly trackerRoutes = new ChangeDetector();
	private readonly trackerCommands = new ChangeDetector();
	private readonly trackerMapMode = new ChangeDetector();
	private readonly trackerCamera = new ChangeDetector();
	private readonly trackerMovementPaths = new ChangeDetector();
	private readonly trackerMovementTargets = new ChangeDetector();
	private readonly trackerSelectedTile = new ChangeDetector();


	constructor(localStateAccess: GameStateAccess) {
		this.localStateAccess = localStateAccess;
	}


	public initialize() {
		this.frameCounter = 0;
		this.trackedChanges = {
			isInitFrame: true,
			turn: true,
			tiles: true,
			settlements: true,
			worldObjects: true,
			routes: true,
			commands: true,
			mapMode: true,
			camera: true,
			movementPaths: true,
			movementTargets: true,
			selectedTile: true,
		};
	}

	public prepareFrame(camera: Camera) {
		if (this.frameCounter >= 2) {
			this.trackedChanges.isInitFrame = false;
		} else {
			this.trackedChanges.isInitFrame = true;
			this.frameCounter++;
		}
		this.trackedChanges.turn = this.trackerTurn.check(this.localStateAccess.getCurrentTurn());
		this.trackedChanges.tiles = this.trackerTiles.check(this.localStateAccess.getTilesRevId());
		this.trackedChanges.settlements = this.trackerSettlements.check(this.localStateAccess.getSettlementsRevId());
		this.trackedChanges.worldObjects = this.trackerWorldObjects.check(this.localStateAccess.getWorldObjectsRevId());
		this.trackedChanges.routes = this.trackerRoutes.check(this.localStateAccess.getRoutesRevId());
		this.trackedChanges.commands = this.trackerCommands.check(this.localStateAccess.getCommandRevId());
		this.trackedChanges.mapMode = this.trackerMapMode.check(this.localStateAccess.getMapMode());
		this.trackedChanges.camera = this.trackerCamera.check(camera.getHash());
		this.trackedChanges.movementPaths = this.trackerMovementPaths.check(this.getMovementPathsCheckId());
		this.trackedChanges.movementTargets = this.trackerMovementTargets.check(this.getMovementTargetsCheckId());
		this.trackedChanges.selectedTile = this.trackerSelectedTile.check(this.getSelectedTileCheckId());
	}

	public getTrackedChanges(): TrackedChanges {
		return this.trackedChanges;
	}

	private getSelectedTileCheckId(): string {
		const selectedTile = this.localStateAccess.getSelectedTile();
		return selectedTile ? selectedTile.id : "-";
	}

	private getMovementPathsCheckId(): string {
		let str = "";
		this.localStateAccess.getMovePaths().forEach(path => {
			path.tiles.forEach(tile => {
				str += tile.position.q + "," + tile.position.r + "/";
			});
			str += path.pending + "/";
		});
		return str;
	}

	private getMovementTargetsCheckId(): string {
		let str = "";
		this.localStateAccess.getMoveTargets().forEach(tile => {
			str += tile.position.q + "," + tile.position.r + "/";
		});
		return str;
	}

}