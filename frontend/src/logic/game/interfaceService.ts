import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {GameRenderer} from "../../renderer/game/gameRenderer";
import {TilePicker} from "./tilePicker";
import {TileService} from "./tileService";
import {CameraService} from "./cameraService";
import {MovementService} from "./movementService";
import {AudioService, AudioType} from "../../common/audioService";
import {TurnEndService} from "./turnEndService";
import {MapMode} from "../../models/misc/mapMode";
import {TilePosition} from "../../models/tile/tilePosition";
import {Command} from "../../models/command/command";
import {TileId} from "../../models/tile/tileId";
import {SettlementId} from "../../models/settlement/settlementId";
import {ProductionOptionEntity} from "../../models/settlement/settlementEntity";
import {WorldObjectId} from "../../models/worldobject/worldObjectId";
import {GameStateWriter} from "../../state/gameStateWriter";
import {TileSummary} from "../../models/tile/tileSummary";

export const INTERFACE_SERVICE: InterfaceService = (undefined as unknown) as InterfaceService; // todo

/**
 * Service providing functionality for user interface and direct user interactions. Acs as a proxy to other services
 */
export interface InterfaceService {
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
	foundSettlement(tile: TileId, worldObjectId: WorldObjectId, name: string): void;
	addProduction(settlementId: SettlementId, entry: ProductionOptionEntity): void,
	cancelProduction(settlementId: SettlementId, entryId: string): void,
	// units / world objects
	beginMovement(worldObjectId: WorldObjectId): void;
	endMovement(commit: boolean): void;
	getTotalMovement(): number;
	// dev functions
	webglContextLoose(): void;
	webglContextRestore(): void;
}

export class InterfaceServiceImpl implements InterfaceService {

	private readonly gameRenderer: GameRenderer;
	private readonly tilePicker: TilePicker;
	private readonly tileService: TileService;
	private readonly cameraService: CameraService;
	private readonly movementService: MovementService;
	private readonly turnEndService: TurnEndService;

	private readonly gameStateWriter: GameStateWriter;

	private readonly audioService: AudioService;

	private readonly canvasHandle: CanvasHandle;

	constructor(
		gameRenderer: GameRenderer,
		tilePicker: TilePicker,
		tileService: TileService,
		cameraService: CameraService,
		movementService: MovementService,
		turnEndService: TurnEndService,
		gameStateWriter: GameStateWriter,
		audioService: AudioService,
	) {
		this.gameRenderer = gameRenderer;
		this.tilePicker = tilePicker;
		this.tileService = tileService;
		this.cameraService = cameraService;
		this.movementService = movementService;
		this.turnEndService = turnEndService;
		this.gameStateWriter = gameStateWriter;
		this.audioService = audioService;
		this.canvasHandle = new CanvasHandle();
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
		const clickedTile = this.tilePicker.tileAt(clientX, clientY, this.canvasHandle);
		if (clickedTile != null) {
			if (this.movementService.isMovementMode()) {
				this.movementService.addToPath(clickedTile.id).then(added => {
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
		const mouseOverTile = this.tilePicker.tileIdAt(clientX, clientY, this.canvasHandle);
		this.tileService.mouseOver(mouseOverTile);
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
		this.gameStateWriter.set
	}

	//========== COMMANDS =====================================================

	commandCancel(command: Command): void {
		// todo
	}

	//========== SETTLEMENTS ==================================================

	getRandomSettlementName(): Promise<string> {
		return Promise.resolve(""); // todo
	}

	validateFoundSettlement(tile: TileId, name: string): string[] {
		return []; // todo
	}

	foundSettlement(tile: TileId, worldObjectId: WorldObjectId, name: string): void {
		// todo
	}

	addProduction(settlementId: SettlementId, entry: ProductionOptionEntity): void {
		// todo
	}

	cancelProduction(settlementId: SettlementId, entryId: string): void {
		// todo
	}

	//========== UNITS / WORLD OBJECTS ========================================

	beginMovement(worldObjectId: WorldObjectId): void {
		// todo
	}

	endMovement(commit: boolean): void {
		// todo
	}

	getTotalMovement(): number {
		return 0; // todo
	}

	//========== DEV FUNCTIONALITY ============================================

	webglContextLoose(): void {
		this.canvasHandle.debugLooseWebglContext();
	}

	webglContextRestore(): void {
		this.canvasHandle.debugRestoreWebglContext();
	}

}