import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "../shared/webgl/canvasHandle";
import {UseTileWindow} from "../ui/pages/ingame/windows/tile/useTileWindow";
import {AudioService, AudioType} from "../shared/audioService";
import {GameRenderer} from "../renderer/game/gameRenderer";
import {GameRepository} from "./gameRepository";

/**
 * Service to handle logic for the continuous game loop.
 */
export class GameLoopService {

	private readonly canvasHandle: CanvasHandle;
	private readonly gameRepository: GameRepository;
	private readonly tilePicker: TilePicker;
	private readonly gameRenderer: GameRenderer;
	private readonly audioService: AudioService;


	constructor(
		tilePicker: TilePicker,
		gameRepository: GameRepository,
		gameRenderer: GameRenderer,
		audioService: AudioService,
	) {
		this.tilePicker = tilePicker;
		this.gameRepository = gameRepository;
		this.gameRenderer = gameRenderer;
		this.audioService = audioService;
		this.canvasHandle = new CanvasHandle();
	}

	/**
	 * Initialize this game loop for the given canvas
	 */
	public initialize(canvas: HTMLCanvasElement) {
		this.canvasHandle.set(canvas);
		this.gameRenderer.initialize(this.canvasHandle);
	}

	/**
	 * Dispose this game loop
	 */
	public dispose() {
		this.canvasHandle.set(null)
		this.gameRenderer.dispose();
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
	public mouseClick(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y, this.canvasHandle);
		if (this.gameRepository.getSelectedTile()?.id !== tile?.identifier) {
			this.gameRepository.setSelectedTile(tile?.identifier ?? null);
			if (tile) {
				AudioType.CLICK_PRIMARY.play(this.audioService);
				UseTileWindow.open(tile.identifier);
			}
		}
	}

	/**
	 * Handle a given mouse movement at to given position relative to the viewport
	 */
	public mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
		if (leftBtnDown) {
			const camera = this.gameRepository.getCamera();
			this.gameRepository.setCamera({
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
		const camera = this.gameRepository.getCamera();
		const dz = d > 0 ? 0.1 : -0.1;
		const zoom = Math.max(0.01, camera.zoom - dz);
		this.gameRepository.setCamera({
			x: camera.x,
			y: camera.y,
			zoom: zoom,
		});
		this.updateHoverTile(x, y);
	}

	private updateHoverTile(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y, this.canvasHandle);
		if (tile?.identifier.id !== this.gameRepository.getHoverTile()?.id) {
			this.gameRepository.setHoverTile(tile?.identifier ?? null);
		}
	}

	/**
	 * @return the canvas handle
	 */
	public getCanvasHandle(): CanvasHandle {
		return this.canvasHandle
	}

}