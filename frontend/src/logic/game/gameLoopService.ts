import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {UseTileWindow} from "../../ui/pages/ingame/windows/tile/useTileWindow";
import {AudioService, AudioType} from "../audio/audioService";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {CameraDatabase} from "../../state/database/cameraDatabase";
import {GameRenderer} from "../../renderer/game/gameRenderer";

export class GameLoopService {

	private readonly canvasHandle: CanvasHandle;
	private readonly cameraDb: CameraDatabase;
	private readonly gameSessionDb: GameSessionDatabase;
	private readonly tilePicker: TilePicker;
	private readonly gameRenderer: GameRenderer;
	private readonly audioService: AudioService;


	constructor(
		canvasHandle: CanvasHandle,
		tilePicker: TilePicker,
		cameraDb: CameraDatabase,
		gameSessionDb: GameSessionDatabase,
		gameRenderer: GameRenderer,
		audioService: AudioService,
	) {
		this.canvasHandle = canvasHandle;
		this.tilePicker = tilePicker;
		this.cameraDb = cameraDb;
		this.gameSessionDb = gameSessionDb;
		this.gameRenderer = gameRenderer;
		this.audioService = audioService;
	}

	public initialize(canvas: HTMLCanvasElement) {
		this.canvasHandle.set(canvas);
		this.gameRenderer.initialize();
	}


	public onGameStateUpdate() {
		this.gameSessionDb.setTurnState("playing");
	}

	public update() {
		this.gameRenderer.render();
	}

	public dispose() {
		this.gameRenderer.dispose();
	}

	public mouseClick(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y);
		if (this.gameSessionDb.getSelectedTile()?.id !== tile?.identifier) {
			this.gameSessionDb.setSelectedTile(tile?.identifier ?? null);
			if (tile) {
				AudioType.CLICK_PRIMARY.play(this.audioService);
				UseTileWindow.open(tile.identifier);
			}
		}
	}

	public mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
		if (leftBtnDown) {
			const camera = this.cameraDb.get();
			this.cameraDb.set({
				// todo: drag-speed (+zoom) seems to be dependent on dpi / screen resolution
				x: camera.x + (dx / camera.zoom),
				y: camera.y - (dy / camera.zoom),
				zoom: camera.zoom,
			});
		} else {
			this.updateHoverTile(x, y);
		}
	}

	public mouseScroll(d: number, x: number, y: number) {
		const camera = this.cameraDb.get();
		const dz = d > 0 ? 0.1 : -0.1;
		const zoom = Math.max(0.01, camera.zoom - dz);
		this.cameraDb.set({
			x: camera.x,
			y: camera.y,
			zoom: zoom,
		});
		this.updateHoverTile(x, y);
	}

	private updateHoverTile(x: number, y: number) {
		const tile = this.tilePicker.tileAt(x, y);
		if (tile?.identifier.id !== this.gameSessionDb.getHoverTile()?.id) {
			this.gameSessionDb.setHoverTile(tile?.identifier ?? null);
		}
	}

}