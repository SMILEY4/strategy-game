import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "./canvasHandle";
import {CameraRepository} from "../../state/access/CameraRepository";
import {GameSessionStateRepository} from "../../state/access/GameSessionStateRepository";
import {TileRepository} from "../../state/access/TileRepository";
import {UseTileWindow} from "../../ui/pages/ingame/windows/tile/useTileWindow";
import {GameRenderer} from "../../renderer/gameRenderer";
import {AudioService, AudioType} from "../audio/audioService";

export class GameLoopService {

    private readonly canvasHandle: CanvasHandle;
    private readonly cameraRepository: CameraRepository;
    private readonly gameSessionRepository: GameSessionStateRepository;
    private readonly tileRepository: TileRepository;
    private readonly tilePicker: TilePicker;
    private readonly gameRenderer: GameRenderer;
    private readonly audioService: AudioService;


    constructor(
        canvasHandle: CanvasHandle,
        tilePicker: TilePicker,
        cameraRepository: CameraRepository,
        gameSessionRepository: GameSessionStateRepository,
        tileRepository: TileRepository,
        gameRenderer: GameRenderer,
        audioService: AudioService
    ) {
        this.canvasHandle = canvasHandle;
        this.tilePicker = tilePicker;
        this.cameraRepository = cameraRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.tileRepository = tileRepository;
        this.gameRenderer = gameRenderer;
        this.audioService = audioService;
    }

    public initialize(canvas: HTMLCanvasElement) {
        this.canvasHandle.set(canvas);
        this.gameRenderer.initialize();
    }


    public onGameStateUpdate() {
        this.gameSessionRepository.setGameTurnState("playing");
    }

    public update() {
        this.gameRenderer.render();
    }

    public dispose() {
        this.gameRenderer.dispose();
    }

    public mouseClick(x: number, y: number) {
        const tile = this.tilePicker.tileAt(x, y);
        if (this.tileRepository.getSelectedTile()?.id !== tile?.identifier) {
            this.tileRepository.setSelectedTile(tile?.identifier || null);
            if (tile) {
                AudioType.CLICK_PRIMARY.play(this.audioService)
                UseTileWindow.open(tile.identifier);
            }
        }
    }

    public mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            const camera = this.cameraRepository.getCamera();
            this.cameraRepository.setCamera({
                // todo: drag-speed (+zoom) seems to be dependent on dpi / screen resolution
                x: camera.x + (dx / camera.zoom),
                y: camera.y - (dy / camera.zoom),
                zoom: camera.zoom,
            });
        } else {
            const tile = this.tilePicker.tileAt(x, y);
            if (tile?.identifier.id !== this.tileRepository.getHoverTile()?.id) {
                this.tileRepository.setHoverTile(tile?.identifier || null);
            }
        }
    }

    public mouseScroll(d: number) {
        const camera = this.cameraRepository.getCamera();
        const dz = d > 0 ? 0.1 : -0.1;
        const zoom = Math.max(0.01, camera.zoom - dz);
        this.cameraRepository.setCamera({
            x: camera.x,
            y: camera.y,
            zoom: zoom,
        });
    }

}