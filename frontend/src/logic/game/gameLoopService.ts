import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {UseTileWindow} from "../../ui/pages/ingame/windows/tile/useTileWindow";
import {AudioService, AudioType} from "../../common/audioService";
import {GameRenderer} from "../../renderer/game/gameRenderer";
import {UseWorldObjectWindow} from "../../ui/pages/ingame/windows/worldobject/useWorldObjectWindow";
import {MovementService} from "./movementService";
import {UseSettlementWindow} from "../../ui/pages/ingame/windows/settlement/useSettlementWindow";
import {TileRepository} from "../../state/repository/tileRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {CameraRepository} from "../../state/repository/cameraRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";

/**
 * Service to handle logic for the continuous game loop.
 */
export class GameLoopService {

	private readonly movementService: MovementService;
	private readonly tilePicker: TilePicker;
	private readonly gameRenderer: GameRenderer;
	private readonly audioService: AudioService;
	private readonly canvasHandle: CanvasHandle;
	private readonly tileRepository: TileRepository;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly settlementRepository: SettlementRepository;
	private readonly cameraRepository: CameraRepository;


	constructor(
		movementService: MovementService,
		tilePicker: TilePicker,
		gameRenderer: GameRenderer,
		audioService: AudioService,
		tileRepository: TileRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
		cameraRepository: CameraRepository,
	) {
		this.movementService = movementService;
		this.tilePicker = tilePicker;
		this.gameRenderer = gameRenderer;
		this.audioService = audioService;
		this.tileRepository = tileRepository;
		this.worldObjectRepository = worldObjectRepository;
		this.settlementRepository = settlementRepository;
		this.cameraRepository = cameraRepository;
		this.canvasHandle = new CanvasHandle();
	}

	/**
	 * Initialize this game loop canvas
	 */
	public initializeCanvas(canvas: HTMLCanvasElement) {
		this.canvasHandle.set(canvas);
		this.gameRenderer.initialize(this.canvasHandle);
	}

	/**
	 * Dispose this game loop canvas
	 */
	public disposeCanvas() {
		this.gameRenderer.dispose();
		this.canvasHandle.set(null);
	}

	/**
	 * Perform a single game update step
	 */
	public update() {
		this.gameRenderer.render(this.canvasHandle);
	}

	/**
	 * Handle a mouse click at the given position relative to the viewport
	 */
	public async mouseClick(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y, this.canvasHandle);
		if (this.tileRepository.getSelected()?.id !== tile?.identifier) {
			this.tileRepository.setSelected(tile?.identifier ?? null);
			if (tile) {
				if (this.movementService.isMovementMode()) {
					const added = await this.movementService.addToPath(tile.identifier);
					if (added) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
					} else {
						AudioType.CLICK_CLOSE.play(this.audioService);
					}
				} else {

					const worldObjects = this.worldObjectRepository.getByTile(tile.identifier);
					const settlement = this.settlementRepository.getByTile(tile.identifier);

					let optionCount = 0;
					optionCount += settlement ? 1 : 0;
					optionCount += worldObjects.length;

					if(optionCount > 1) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
						UseTileWindow.open(tile.identifier)
						return;
					}

					if (worldObjects.length === 1) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
						UseWorldObjectWindow.open(worldObjects[0].identifier.id);
						return;
					}

					if (settlement) {
						AudioType.CLICK_PRIMARY.play(this.audioService);
						UseSettlementWindow.open(settlement.identifier.id);
						return;
					}

					AudioType.CLICK_PRIMARY.play(this.audioService);
					UseTileWindow.open(tile.identifier);
					return;
				}
			}
		}
	}

	/**
	 * Handle a given mouse movement at to given position relative to the viewport
	 */
	public mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
		if (leftBtnDown) {
			const camera = this.cameraRepository.get();
			this.cameraRepository.set({
				// todo: drag-speed (+zoom) seems to be dependent on dpi / screen resolution
				x: camera.x + (dx / camera.zoom),
				y: camera.y - (dy / camera.zoom),
				zoom: camera.zoom,
			});
		} else {
			this.updateHoverTile(x, y);
		}
	}

	/**
	 * Handle the given mouse scroll at the given position relative to the viewport
	 */
	public mouseScroll(d: number, x: number, y: number) {
		const camera = this.cameraRepository.get();
		const dz = d > 0 ? 0.1 : -0.1;
		const zoom = Math.max(0.01, camera.zoom - dz);
		this.cameraRepository.set({
			x: camera.x,
			y: camera.y,
			zoom: zoom,
		});
		this.updateHoverTile(x, y);
	}

	private updateHoverTile(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y, this.canvasHandle);
		if (tile?.identifier.id !== this.tileRepository.getHover()?.id) {
			this.tileRepository.setHover(tile?.identifier ?? null);
		}
	}

	/**
	 * @return the canvas handle
	 */
	public getCanvasHandle(): CanvasHandle {
		return this.canvasHandle;
	}

}