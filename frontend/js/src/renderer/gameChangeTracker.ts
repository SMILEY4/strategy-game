import {GameStateAccess} from "../state/gameStateAccess";
import {Camera} from "../common/webgl/camera";
import {ChangeDetector} from "../common/changeDetector";
import {Interaction} from "../models/misc/interaction";
import {Command} from "../models/command/command";

export interface TrackedChanges {
	isInitFrame: boolean;
	turn: boolean,
	tiles: boolean,
	worldObjects: boolean,
	commands: boolean,
	mapMode: boolean,
	camera: boolean,
	movementPaths: boolean,
	highlightedTiles: boolean,
	selectedTile: boolean,
    hoveredTile: boolean,
}

export class GameChangeTracker {

	private readonly gameStateAccess: GameStateAccess;

	private frameCounter: number = 0;
	private trackedChanges: TrackedChanges = null as any;

	private readonly trackerTurn = new ChangeDetector();
	private readonly trackerTiles = new ChangeDetector();
	private readonly trackerWorldObjects = new ChangeDetector();
	private readonly trackerCommands = new ChangeDetector();
	private readonly trackerMapMode = new ChangeDetector();
	private readonly trackerCamera = new ChangeDetector();
	private readonly trackerMovementPaths = new ChangeDetector();
	private readonly trackerHighlightedTiles = new ChangeDetector();
	private readonly trackerSelectedTile = new ChangeDetector();
    private readonly trackerHoveredTile = new ChangeDetector();


	constructor(gameStateAccess: GameStateAccess) {
		this.gameStateAccess = gameStateAccess;
	}


	public initialize() {
		this.frameCounter = 0;
		this.trackedChanges = {
			isInitFrame: true,
			turn: true,
			tiles: true,
			worldObjects: true,
			commands: true,
			mapMode: true,
			camera: true,
			movementPaths: true,
			highlightedTiles: true,
			selectedTile: true,
            hoveredTile: true
		};
	}

	public prepareFrame(camera: Camera) {
		if (this.frameCounter >= 2) {
			this.trackedChanges.isInitFrame = false;
		} else {
			this.trackedChanges.isInitFrame = true;
			this.frameCounter++;
		}
		this.trackedChanges.turn = this.trackerTurn.check(this.gameStateAccess.getCurrentTurn());
		this.trackedChanges.tiles = this.trackerTiles.check(this.gameStateAccess.getTilesRevId());
		this.trackedChanges.worldObjects = this.trackerWorldObjects.check(this.gameStateAccess.getWorldObjectsRevId());
		this.trackedChanges.commands = this.trackerCommands.check(this.gameStateAccess.getCommandRevId());
		this.trackedChanges.mapMode = this.trackerMapMode.check(this.gameStateAccess.getMapMode());
		this.trackedChanges.camera = this.trackerCamera.check(camera.getHash());
		this.trackedChanges.movementPaths = this.trackerMovementPaths.check(this.getMovementPathsCheckId());
		this.trackedChanges.highlightedTiles = this.trackerHighlightedTiles.check(this.getHighlightedTilesCheckId());
		this.trackedChanges.selectedTile = this.trackerSelectedTile.check(this.getSelectedTileCheckId());
        this.trackedChanges.hoveredTile = this.trackerHoveredTile.check(this.getHoveredTileCheckId());
    }

	public getTrackedChanges(): TrackedChanges {
		return this.trackedChanges;
	}

	private getSelectedTileCheckId(): string {
		const tile = this.gameStateAccess.getSelectedTile();
		return tile ? tile.id : "-";
	}

    private getHoveredTileCheckId(): string {
        const tile = this.gameStateAccess.getHoveredTile();
        return tile ? tile.id : "-";
    }

	private getMovementPathsCheckId(): string {
		let str = "";

        // from pending
        const interactionState = this.gameStateAccess.getInteractionState()
        if(interactionState?.type === Interaction.Type.Move) {
            interactionState.path.forEach(tile => {
                str += tile.position.q + "," + tile.position.r + "/";
            });
            str += "pending/";
        }

        // from commands
        this.gameStateAccess.getCommandsOfType(Command.Type.Move).forEach(command => {
            command.path.forEach(tile => {
                str += tile.position.q + "," + tile.position.r + "/";
            });
        })

		return str;
	}

	private getHighlightedTilesCheckId(): string {
		let str = "";
		this.gameStateAccess.getHighlightedTiles().forEach(highlight => {
			str += highlight.tile.q + "," + highlight.tile.r + "/";
		});
		return str;
	}

}