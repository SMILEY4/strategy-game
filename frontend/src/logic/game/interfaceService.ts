import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {GameRenderer} from "../../renderer/game/gameRenderer";
import {TilePicker} from "./tilePicker";
import {TileService} from "./tileService";
import {CameraService} from "./cameraService";
import {MovementService} from "./movementService";
import {AudioService, AudioType} from "../../common/audioService";
import {TurnEndService} from "./turnEndService";
import {Command} from "../../models/base/command";
import {TileIdentifier} from "../../models/base/tile";
import {MapMode} from "../../models/base/mapMode";
import {ProductionQueueEntry, SettlementIdentifier} from "../../models/base/Settlement";
import {ProductionOptionAggregate} from "../../models/aggregates/SettlementAggregate";
import {SettlementProductionOption, SettlementProductionQueueEntry} from "../../models/settlement/settlement";

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
	focusCamera(tile: TileIdentifier): void
	// basic game functionality
	endTurn(): void;
	selectMapMode(mapMode: MapMode): void
	// commands
	commandCancel(command: Command): void;
	// settlements
	getRandomSettlementName(): Promise<string>;
	validateFoundSettlement(tile: TileIdentifier, name: string): string[];
	foundSettlement(tile: TileIdentifier, worldObjectId: string, name: string): void;
	addProduction(settlementId: SettlementIdentifier, entry: SettlementProductionOption): void,
	cancelProduction(settlementId: string, entryId: string): void,
	// units / world objects
	beginMovement(worldObjectId: string): void;
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

	private readonly audioService: AudioService;

	private readonly canvasHandle: CanvasHandle;

	constructor(
		gameRenderer: GameRenderer,
		tilePicker: TilePicker,
		tileService: TileService,
		cameraService: CameraService,
		movementService: MovementService,
		turnEndService: TurnEndService,
		audioService: AudioService,
	) {
		this.gameRenderer = gameRenderer;
		this.tilePicker = tilePicker;
		this.tileService = tileService;
		this.cameraService = cameraService;
		this.movementService = movementService;
		this.turnEndService = turnEndService;
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
		const clickedTileId = this.tilePicker.tileIdAt(clientX, clientY, this.canvasHandle);
		if (clickedTileId != null) {
			if (this.movementService.isMovementMode()) {
				this.movementService.addToPath(clickedTileId).then(added => {
					if (added) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
					} else {
						AudioType.CLICK_CLOSE.play(this.audioService);
					}
				});
			} else {
				this.tileService.clickTile(clickedTileId);
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

	//========== BASIC GAME FUNCTIONALITY =====================================

	endTurn(): void {
		this.turnEndService.endTurn();
	}

	selectMapMode(mapMode: MapMode): void {
	}

	//========== COMMANDS =====================================================


	commandCancel(command: Command): void {
	}

	//========== SETTLEMENTS ==================================================

	getRandomSettlementName(): Promise<string> {
		return Promise.resolve("");
	}

	validateFoundSettlement(tile: TileIdentifier, name: string): string[] {
		return [];
	}

	foundSettlement(tile: TileIdentifier, worldObjectId: string, name: string): void {
	}

	//========== DEV FUNCTIONALITY ============================================

	webglContextLoose(): void {
		this.canvasHandle.debugLooseWebglContext();
	}

	webglContextRestore(): void {
		this.canvasHandle.debugRestoreWebglContext();
	}

}