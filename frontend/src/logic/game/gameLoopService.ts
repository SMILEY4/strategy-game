import {GameRenderer} from "../renderer/gameRenderer";
import {TilePicker} from "./tilePicker";
import {CanvasHandle} from "./canvasHandle";
import {openTileWindow} from "../../ui/pages/ingame/windows/tile/TileWindow";
import {CameraRepository} from "../../state/access/CameraRepository";
import {GameSessionStateRepository} from "../../state/access/GameSessionStateRepository";
import {TileRepository} from "../../state/access/TileRepository";

export class GameLoopService {

    private readonly canvasHandle: CanvasHandle;
    private readonly renderer: GameRenderer;
    private readonly cameraRepository: CameraRepository;
    private readonly gameSessionRepository: GameSessionStateRepository;
    private readonly tileRepository: TileRepository;
    private readonly tilePicker: TilePicker;

    constructor(canvasHandle: CanvasHandle,
                renderer: GameRenderer,
                tilePicker: TilePicker,
                cameraRepository: CameraRepository,
                gameSessionRepository: GameSessionStateRepository,
                tileRepository: TileRepository) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
        this.tilePicker = tilePicker;
        this.cameraRepository = cameraRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.tileRepository = tileRepository;
    }

    public initialize(canvas: HTMLCanvasElement) {
        this.canvasHandle.set(canvas);
        this.renderer.initialize();
        this.renderer.updateWorld();
    }


    public onGameStateUpdate() {
        this.renderer.updateWorld();
        this.gameSessionRepository.setGameTurnState("playing");
    }

    public update() {
        this.renderer.render();
    }

    public dispose() {
        this.renderer.dispose();
    }

    public mouseClick(x: number, y: number) {
        const tile = this.tilePicker.tileAt(x, y);
        if (this.tileRepository.getSelectedTile()?.id !== tile?.identifier) {
            this.tileRepository.setSelectedTile(tile?.identifier || null);
            if (tile) {
                openTileWindow(tile.identifier);
            }
        }
    }

    public mouseMove(dx: number, dy: number, x: number, y: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            const camera = this.cameraRepository.getCamera();
            this.cameraRepository.setCamera({
                x: camera.x + (dx / camera.zoom * 2),
                y: camera.y - (dy / camera.zoom * 2),
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