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
import {LinesRenderLayer} from "./layers/linesRenderLayer";
import {RouteRepository} from "../../../state/access/RouteRepository";
import {TilemapUtils} from "../../game/tilemapUtils";

export class WorldUpdater {

    private readonly commandRepository: CommandRepository;
    private readonly cityRepository: CityRepository;
    private readonly tileRepository: TileRepository;
    private readonly routeRepository: RouteRepository;
    private readonly canvasHandle: CanvasHandle;
    private world: RenderWorld | null = null;
    private lastRevIdCommandState = "";
    private lastZoom = -999;

    constructor(canvasHandle: CanvasHandle,
                commandRepository: CommandRepository,
                cityRepository: CityRepository,
                tileRepository: TileRepository,
                routeRepository: RouteRepository) {
        this.canvasHandle = canvasHandle;
        this.commandRepository = commandRepository;
        this.cityRepository = cityRepository;
        this.tileRepository = tileRepository;
        this.routeRepository = routeRepository;
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
            const commandsChanged = this.lastRevIdCommandState !== this.commandRepository.getRevId()
            const zoomChanged = this.lastZoom !== camera.getZoom();
            this.lastRevIdCommandState = this.commandRepository.getRevId();
            this.lastZoom = camera.getZoom();
            if(commandsChanged || zoomChanged) {
                this.rebuildEntityLayer(camera);
            }
            if(commandsChanged) {
                this.rebuildLinesLayer();
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
        console.log("rebuild entities")
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

    private rebuildLinesLayer() {
        const layer = this.world!.getLayerById(LinesRenderLayer.LAYER_ID) as LinesRenderLayer;
        const lines: number[][][] = this.routeRepository.getRoutes().map(route => {
            return route.path.map(tile => {
                return TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
            });
        });
        layer.setLines(lines);
    }

}