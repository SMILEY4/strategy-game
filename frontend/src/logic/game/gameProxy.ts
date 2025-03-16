import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {GameRenderer} from "../../renderer/game/gameRenderer";
import {TileService} from "./service/tileService";
import {CameraService} from "./service/cameraService";
import {MovementService} from "./service/movementService";
import {AudioService, AudioType} from "../../common/audioService";
import {TurnEndService} from "./service/turnEndService";
import {MapMode} from "../../models/misc/mapMode";
import {TilePosition} from "../../models/tile/tilePosition";
import {Command} from "../../models/command/command";
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

/**
 * Service providing functionality for user interface and direct user interactions. Acts as a proxy to other services
 */
export interface GameProxy {
	// session
	listSessions(): Promise<GameSessionMeta[]>;
	createSession(name: string, seed: string | null): Promise<string>;
	joinSession(gameId: string): Promise<void>;
	deleteSession(gameId: string): Promise<void>;
	connectSession(gameId: string): Promise<void>;
	disconnectSession(): Promise<void>;
	// main game loop
	initialize(canvas: HTMLCanvasElement): void;
	update(): void;
	dispose(): void;
	// generic user interactions
	mouseClicked(clientX: number, clientY: number): void;
	mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void;
	mouseScrolled(d: number, clientX: number, clientY: number): void;
	// camera
	focusCamera(tilePosition: TilePosition): void
	// basic game functionality
	endTurn(): void;
	selectMapMode(mapMode: MapMode): void
	// commands
	commandCancel(command: Command): void;
	// settlements
	getRandomSettlementName(): Promise<string>;
	validateFoundSettlement(tile: TileId, name: string): string[];
	foundSettlement(tile: TileSummary, worldObjectId: WorldObjectId, name: string): void;
	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void,
	cancelProduction(settlement: SettlementSummary, entryId: string): void,
	// units / world objects
	beginMovement(worldObjectId: WorldObjectId): void;
	endMovement(commit: boolean): void;
	// dev functions
	webglContextLoose(): void;
	webglContextRestore(): void;
}

export class GameProxyImpl implements GameProxy {

	private readonly gameRenderer: GameRenderer;
	private readonly tileService: TileService;
	private readonly cameraService: CameraService;
	private readonly movementService: MovementService;
	private readonly turnEndService: TurnEndService;
	private readonly settlementService: SettlementService;
	private readonly commandService: CommandService;
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
				this.tileService.clickTile(TileSummary.from(clickedTile));
			}
		}
	}

	mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean): void {
		if (leftBtnDown) {
			this.cameraService.move(dx, dy);
		} else {
			this.updateMouseOver(clientX, clientY);
		}
	}

	mouseScrolled(d: number, clientX: number, clientY: number): void {
		this.cameraService.zoom(d > 0 ? 0.1 : -0.1);
		this.updateMouseOver(clientX, clientY);
	}

	private updateMouseOver(clientX: number, clientY: number) {
		const mouseOverTile = this.tileService.pickTileAt(clientX, clientY, this.canvasHandle);
		this.tileService.mouseOver(TileSummary.fromOrNull(mouseOverTile));
	}

	//========== CAMERA =======================================================

	focusCamera(tilePosition: TilePosition): void {
		this.cameraService.center(tilePosition);
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
	}

	addProduction(settlement: SettlementSummary, entry: SettlementProductionOption): void {
		this.settlementService.addProduction(settlement, entry);
	}

	cancelProduction(settlement: SettlementSummary, entryId: string): void {
		this.settlementService.cancelProduction(settlement, entryId);
	}

	//========== UNITS / WORLD OBJECTS ========================================

	beginMovement(worldObjectId: WorldObjectId): void {
		this.movementService.beginMovement(worldObjectId).then();
	}

	endMovement(commit: boolean): void {
		if (commit) {
			this.movementService.completeMovement();
		} else {
			this.movementService.cancelMovement();
		}
	}

	//========== DEV FUNCTIONALITY ============================================

	webglContextLoose(): void {
		this.canvasHandle.debugLooseWebglContext();
	}

	webglContextRestore(): void {
		this.canvasHandle.debugRestoreWebglContext();
	}

}