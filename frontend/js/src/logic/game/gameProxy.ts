import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {TileService} from "./service/tileService";
import {CameraService} from "./service/cameraService";
import {MovementService} from "./service/movementService";
import {AudioService, AudioType} from "../../common/audioService";
import {TurnEndService} from "./service/turnEndService";
import {MapMode} from "../../models/misc/mapMode";
import {TilePosition} from "../../models/tile/tilePosition";
import {Command, DisbandWorldObjectCommand} from "../../models/command/command";
import {TileId} from "../../models/tile/tileId";
import {WorldObjectId} from "../../models/worldobject/worldObjectId";
import {GameStateWriter} from "../../state/gameStateWriter";
import {TileSummary} from "../../models/tile/tileSummary";
import {SettlementService} from "./service/settlementService";
import {SettlementSummary} from "../../models/settlement/settlementSummary";
import {SettlementProductionOption} from "../../models/settlement/settlement";
import {GameSessionMeta} from "../../models/misc/gameSessionMeta";
import {GameSessionService} from "./service/gameSessionService";
import {CommandService} from "./service/commandService";
import {CommandType} from "../../models/command/commandType";
import {UID} from "../../common/uid";
import {MonitoringService} from "./service/monitoringService";
import {GameRenderer} from "../../renderer/gameRenderer";

/**
 * Service providing functionality for user interface and direct user interactions. Acts as a proxy to other services
 */
export interface GameProxy {
	// session
	/**
	 * Get all games of the currently logged-in user.
	 */
	listSessions(): Promise<GameSessionMeta[]>;
	/**
	 * Create a new game with the given name and settings.
	 */
	createSession(name: string, seed: string | null): Promise<string>;
	/**
	 * Join a game with the given id as a new player.
	 */
	joinSession(gameId: string): Promise<void>;
	/**
	 * Delete a game with the given id.
	 */
	deleteSession(gameId: string): Promise<void>;
	/**
	 * Connect to the game with the given id and "start" playing.
	 */
	connectSession(gameId: string): Promise<void>;
	/**
	 * Disconnect from the current session.
	 */
	disconnectSession(): Promise<void>;
	// main game loop
	/**
	 * Initialize the main game/rendering loop.
	 */
	initialize(canvas: HTMLCanvasElement): void;
	/**
	 * Update step in the main game/rendering loop.
	 */
	update(): void;
	/**
	 * Dispose the main game/rendering loop.
	 */
	dispose(): void;
	// generic user interactions
	/**
	 * Handle a mouse click at the given screen location.
	 */
	mouseClicked(clientX: number, clientY: number): void;
	/**
	 * Handle a mouse movement event.
	 */
	mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void;
	/**
	 * Handle a mouse scroll event.
	 */
	mouseScrolled(d: number, clientX: number, clientY: number): void;
	// camera
	/**
	 * Move the camera to focus on the given tile.
	 */
	focusCamera(tilePosition: TilePosition): void
	// basic game functionality
	/**
	 * End the current turn and send commands to server.
	 */
	endTurn(): void;
	/**
	 * Select the given map mode as the new active map mode.
	 */
	selectMapMode(mapMode: MapMode): void
	// commands
	/**
	 * Cancel the given command.
	 */
	commandCancel(command: Command): void;
	// settlements
	/**
	 * Get a random name for a settlement.
	 */
	getRandomSettlementName(): Promise<string>;
	/**
	 * Validate whether the settlement can be created.
	 * Returns a list of reasons if invalid.
	 */
	validateFoundSettlement(tile: TileId, name: string): string[];
	/**
	 * Create a new settlement.
	 */
	foundSettlement(tile: TileSummary, worldObjectId: WorldObjectId, name: string): void;
	/**
	 * Add a new entry to the given settlements production queue.
	 */
	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void,
	/**
	 * Cancel the given entry in the given settlements production queue.
	 */
	cancelProduction(settlement: SettlementSummary, entryId: string): void,
	// units / world objects
	/**
	 * Start "move" mode for the given world object.
	 */
	beginMovement(worldObjectId: WorldObjectId): void;
	/**
	 * End the movement. Submit or discard the move command.
	 */
	endMovement(commit: boolean): void;
	/**
	 * Disband (i.e. delete) the given world object.
	 */
	disbandWorldObject(worldObjectId: WorldObjectId): void;
	// dev functions
	/**
	 * Loose the current webgl context for debug purposes.
	 */
	webglContextLoose(): void;
	/**
	 * Restore the webgl context for debug purposes.
	 */
	webglContextRestore(): void;
	/**
	 * Export the current monitoring data
	 */
	exportMonitoringData(): void
}

export class GameProxyImpl implements GameProxy {

	private readonly gameRenderer: GameRenderer;
	private readonly tileService: TileService;
	private readonly cameraService: CameraService;
	private readonly movementService: MovementService;
	private readonly turnEndService: TurnEndService;
	private readonly settlementService: SettlementService;
	private readonly commandService: CommandService;
	private readonly monitoringService: MonitoringService;
	private readonly gameSessionService: GameSessionService;
	private readonly gameStateWriter: GameStateWriter;
	private readonly audioService: AudioService;
	private readonly canvasHandle: CanvasHandle;

	constructor(
		gameRenderer: GameRenderer,
		tileService: TileService,
		cameraService: CameraService,
		movementService: MovementService,
		turnEndService: TurnEndService,
		settlementService: SettlementService,
		commandService: CommandService,
		monitoringService: MonitoringService,
		gameSessionService: GameSessionService,
		gameStateWriter: GameStateWriter,
		audioService: AudioService,
	) {
		this.gameRenderer = gameRenderer;
		this.tileService = tileService;
		this.cameraService = cameraService;
		this.movementService = movementService;
		this.turnEndService = turnEndService;
		this.settlementService = settlementService;
		this.commandService = commandService;
		this.monitoringService = monitoringService;
		this.gameSessionService = gameSessionService;
		this.gameStateWriter = gameStateWriter;
		this.audioService = audioService;
		this.canvasHandle = new CanvasHandle();
	}

	//========== SESSION ========================================================

	listSessions(): Promise<GameSessionMeta[]> {
		return this.gameSessionService.listSessions();
	}

	createSession(name: string, seed: string | null): Promise<string> {
		return this.gameSessionService.createSession(name, seed);
	}

	joinSession(gameId: string): Promise<void> {
		return this.gameSessionService.joinSession(gameId);
	}

	deleteSession(gameId: string): Promise<void> {
		return this.gameSessionService.deleteSession(gameId);
	}

	connectSession(gameId: string): Promise<void> {
		return this.gameSessionService.connectSession(gameId);
	}

	disconnectSession(): Promise<void> {
		return this.gameSessionService.disconnectSession();
	}

	//========== MAIN GAME LOOP ===============================================

	initialize(canvas: HTMLCanvasElement): void {
		this.canvasHandle.set(canvas);
		this.gameRenderer.initialize(this.canvasHandle);
	}

	dispose(): void {
		this.gameRenderer.dispose();
		this.canvasHandle.set(null);
	}

	update(): void {
		this.gameRenderer.render(this.canvasHandle);
	}

	//========== GENERIC USER INTERACTIONS ====================================

	mouseClicked(clientX: number, clientY: number): void {
		const clickedTile = this.tileService.pickTileAt(clientX, clientY, this.canvasHandle);
		if (clickedTile != null) {
			if (this.movementService.isMovementActive()) {
				this.movementService.addStep(clickedTile.id).then(added => {
					if (added) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
					} else {
						AudioType.CLICK_CLOSE.play(this.audioService);
					}
				});
			} else {
				this.tileService.clickTile(clickedTile);
				AudioType.CLICK_PRIMARY.play(this.audioService);
			}
		}
	}

	mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void {
		if (leftBtnDown) {
			this.cameraService.move(dx, dy, this.canvasHandle);
		} else {
			this.updateMouseOver(clientX, clientY);
		}
	}

	mouseScrolled(d: number, clientX: number, clientY: number): void {
		this.cameraService.zoomAt(clientX, clientY, d > 0 ? "out" : "in", this.canvasHandle)
		this.updateMouseOver(clientX, clientY);
	}

	private updateMouseOver(clientX: number, clientY: number) {
		const mouseOverTile = this.tileService.pickTileAt(clientX, clientY, this.canvasHandle);
		this.tileService.mouseOver(mouseOverTile);
	}

	//========== CAMERA =======================================================

	focusCamera(tilePosition: TilePosition): void {
		this.cameraService.centerOnTile(tilePosition);
	}


	//========== BASIC GAME FUNCTIONALITY =====================================

	endTurn(): void {
		this.turnEndService.endTurn();
	}

	selectMapMode(mapMode: MapMode): void {
		this.gameStateWriter.setSelectedMapMode(mapMode);
	}

	//========== COMMANDS =====================================================

	commandCancel(command: Command): void {
		this.commandService.cancelCommand(command.id);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	//========== SETTLEMENTS ==================================================

	getRandomSettlementName(): Promise<string> {
		return this.settlementService.getRandomName();
	}

	validateFoundSettlement(tile: TileId, name: string): string[] {
		return this.settlementService.validateFounding(tile, name);
	}

	foundSettlement(tile: TileSummary, worldObjectId: WorldObjectId, name: string): void {
		this.settlementService.foundSettlement(tile, worldObjectId, name);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void {
		this.settlementService.addProduction(settlement, entry);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	cancelProduction(settlement: SettlementSummary, entryId: string): void {
		this.settlementService.cancelProduction(settlement, entryId);
		AudioType.WRITING_ON_PAPER.play(this.audioService);
	}

	//========== UNITS / WORLD OBJECTS ========================================

	beginMovement(worldObjectId: WorldObjectId): void {
		this.movementService.beginMovement(worldObjectId).then();
		AudioType.CLICK_PRIMARY.play(this.audioService);
	}

	endMovement(commit: boolean): void {
		if (commit) {
			this.movementService.completeMovement();
			AudioType.WRITING_ON_PAPER.play(this.audioService);
		} else {
			this.movementService.cancelMovement();
			AudioType.CLICK_CLOSE.play(this.audioService);
		}
	}

	disbandWorldObject(worldObjectId: WorldObjectId): void {
		this.commandService.addCommand<DisbandWorldObjectCommand>({
			id: UID.generate(),
			type: CommandType.DISBAND_WORLD_OBJECT,
			worldObjectId: worldObjectId,
		});
	}

	//========== DEV FUNCTIONALITY ============================================

	webglContextLoose(): void {
		this.canvasHandle.debugLooseWebglContext();
	}

	webglContextRestore(): void {
		this.canvasHandle.debugRestoreWebglContext();
	}

	exportMonitoringData(): void {
		this.monitoringService.exportData();
	}
}