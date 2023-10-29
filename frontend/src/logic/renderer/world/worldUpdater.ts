import {RenderWorld} from "./data/renderWorld";
import {TerrainRenderLayer} from "./layers/terrainRenderLayer";
import {TerrainChunkBuilder} from "./builders/terrainChunkBuilder";
import {EntityRenderLayer} from "./layers/entityRenderLayer";
import {EntityDataBuilder} from "./builders/entityDataBuilder";
import {Camera} from "../common/camera";
import {CommandRepository} from "../../../state/access/CommandRepository";
import {CityRepository} from "../../../state/access/CityRepository";
import {TileRepository} from "../../../state/access/TileRepository";
import {CanvasHandle} from "../../game/canvasHandle";

export class WorldUpdater {

    private readonly commandRepository: CommandRepository;
    private readonly cityRepository: CityRepository;
    private readonly tileRepository: TileRepository;
    private readonly canvasHandle: CanvasHandle;
    private world: RenderWorld | null = null;
    private lastRevIdCommandState = "";
    private lastZoom = -999;

    constructor(canvasHandle: CanvasHandle,
                commandRepository: CommandRepository,
                cityRepository: CityRepository,
                tileRepository: TileRepository) {
        this.canvasHandle = canvasHandle;
        this.commandRepository = commandRepository;
        this.cityRepository = cityRepository;
        this.tileRepository = tileRepository;
    }

    public setWorld(world: RenderWorld) {
        this.world = world;
    }


    public updateOnNextTurn(camera: Camera) {
        if (this.world) {
            this.rebuildTerrainLayer();
            this.rebuildEntityLayer(camera);
        }
    }

    public update(camera: Camera) {
        if (this.world) {
            const currentRevId = this.commandRepository.getRevId();
            if (currentRevId !== this.lastRevIdCommandState || this.lastZoom !== camera.getZoom()) {
                this.lastRevIdCommandState = currentRevId;
                this.rebuildEntityLayer(camera);
                this.lastZoom = camera.getZoom();
            }
        }
    }

    private rebuildTerrainLayer() {
        const layer = this.world!.getLayerById(TerrainRenderLayer.LAYER_ID) as TerrainRenderLayer;
        layer.disposeWorldData();
        layer.setChunks(
            TerrainChunkBuilder.create(
                this.tileRepository.getTileContainer(),
                this.canvasHandle.getGL(),
                layer.getShaderAttributes(),
            ),
        );
    }

    private rebuildEntityLayer(camera: Camera) {
        const layer = this.world!.getLayerById(EntityRenderLayer.LAYER_ID) as EntityRenderLayer;
        layer.disposeWorldData();
        layer.setMesh(
            EntityDataBuilder.create(
                this.canvasHandle.getGL(),
                camera,
                this.tileRepository.getTiles(),
                this.cityRepository.getCities(),
                this.commandRepository.getCommands(),
                layer.getShaderAttributes(),
                layer.getTextRenderer(),
            ),
        );
    }

}