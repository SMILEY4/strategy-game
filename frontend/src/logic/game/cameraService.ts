import {CameraRepository} from "../../state/repository/cameraRepository";
import {TileIdentifier} from "../../models/base/tile";
import {Projections} from "../../common/webgl/projections";

export class CameraService {

    private readonly cameraRepository: CameraRepository;

    constructor(cameraRepository: CameraRepository) {
        this.cameraRepository = cameraRepository;
    }

    public centerCameraOnTile(tile: TileIdentifier) {
        const pos = Projections.hexToWorld(tile.q, tile.r);
        const camera = this.cameraRepository.get();
        this.cameraRepository.set({
            x: -pos.x,
            y: -pos.y,
            zoom: camera.zoom,
        });
    }

}