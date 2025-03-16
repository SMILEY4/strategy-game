import {ChangeDetector} from "../../common/changeDetector";
import {Camera} from "../../common/webgl/camera";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {LabelsHtmlNode} from "./rendernodes/labelsHtmlNode";
import {ChangeProvider} from "../common/graph/changeProvider";
import {VertexFullQuadNode} from "../common/prebuilt/vertexFullquadNode";
import {TilesBaseVertexNode} from "./rendernodes/tilesBaseVertexNode";
import {OverlayBaseVertexNode} from "./rendernodes/overlayBaseVertexNode";
import {MapDetailsVertexNode} from "./rendernodes/mapDetailsVertexNode";
import {GameStateAccess} from "../../state/gameStateAccess";

interface Changes {
	initFrame: boolean,
	turn: boolean,
	mapMode: boolean,
	camera: boolean,
	movementPaths: boolean,
	commands: boolean,
}

/**
 * Detects changes in the game state to determine whether a render node needs to update or not
 */
export class GameChangeProvider implements ChangeProvider {

	private readonly localStateAccess: GameStateAccess;

	private readonly detectorCamera = new ChangeDetector();
	private readonly detectorCurrentTurn = new ChangeDetector();
	private readonly detectorMapMode = new ChangeDetector();
	private readonly detectorMovementPaths = new ChangeDetector();
	private readonly detectorCommands = new ChangeDetector();

	private frame: number = 0;
	private changes: Changes = {
		initFrame: true,
		turn: true,
		mapMode: true,
		camera: true,
		movementPaths: true,
		commands: true,
	};

	constructor(localStateAccess: GameStateAccess) {
		this.localStateAccess = localStateAccess;
	}

	/**
	 * Resets this change provider to an initial state
	 */
	public initialize() {
		this.frame = 0;
		this.changes = {
			initFrame: true,
			turn: true,
			mapMode: true,
			camera: true,
			movementPaths: true,
			commands: true,
		};
	}

	/**
	 * Detect changes for the current/upcoming frame
	 */
	public prepareFrame(camera: Camera) {
		if (this.frame >= 2) {
			this.changes.initFrame = false;
		} else {
			this.changes.initFrame = true;
			this.frame++;
		}
		this.changes.turn = this.detectorCurrentTurn.check(this.localStateAccess.getCurrentTurn());
		this.changes.mapMode = this.detectorMapMode.check(this.localStateAccess.getMapMode());
		this.changes.camera = this.detectorCamera.check(camera.getHash());
		this.changes.movementPaths = this.detectorMovementPaths.check(this.getMovementPathsCheckId());
		this.changes.commands = this.detectorCommands.check(this.localStateAccess.getCommandRevId());
	}

	/**
	 * @return whether there are changes relevant to the action or render-node with the given key
	 */
	public hasChange(key: string): boolean {
		if (this.changes.initFrame) {
			return true;
		}
		if (key === VertexFullQuadNode.ID) {
            return this.changes.initFrame;
		}
		if(key == MapDetailsVertexNode.ID) {
			return this.changes.turn;
		}
		if (key === OverlayBaseVertexNode.ID) {
			return this.changes.initFrame;
		}
		if (key === OverlayVertexNode.ID) {
			return this.changes.turn || this.changes.mapMode || this.changes.movementPaths;
		}
		if (key === TilesBaseVertexNode.ID) {
			return this.changes.initFrame;
		}
		if (key === TilesVertexNode.ID) {
			return this.changes.turn;
		}
		if (key === ResourceIconsHtmlNode.ID) {
			return this.changes.turn || this.changes.mapMode || this.changes.camera;
		}
		if (key === PathsHtmlNode.ID) {
			return this.changes.turn || this.changes.camera || this.changes.movementPaths;
		}
		if (key === LabelsHtmlNode.ID) {
			return this.changes.turn || this.changes.camera || this.changes.commands;
		}
		return true;
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

}