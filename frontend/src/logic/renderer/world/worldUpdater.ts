import {RenderWorld} from "./data/renderWorld";
import {TerrainRenderLayer} from "./layers/terrainRenderLayer";
import {TerrainChunkBuilder} from "./builders/terrainChunkBuilder";
import {GameStateAccess} from "../../../state/access/GameStateAccess";
import {EntityRenderLayer} from "./layers/entityRenderLayer";
import {EntityDataBuilder} from "./builders/entityDataBuilder";
import {CommandStateAccess} from "../../../state/access/CommandStateAccess";
import {Camera} from "../common/camera";

export class WorldUpdater {

    private readonly world: RenderWorld;
    private readonly gl: WebGL2RenderingContext;
    private lastRevIdCommandState = "";

    private lastZoom = -999;

    constructor(gl: WebGL2RenderingContext, world: RenderWorld) {
        this.world = world;
        this.gl = gl;
    }


    public updateOnNextTurn(camera: Camera) {
        this.rebuildTerrainLayer();
        this.rebuildEntityLayer(camera);
    }

    public update(camera: Camera) {
        if (CommandStateAccess.getRevId() !== this.lastRevIdCommandState) {
            this.lastRevIdCommandState = CommandStateAccess.getRevId();
        }
        if (CommandStateAccess.getRevId() !== this.lastRevIdCommandState || this.lastZoom !== camera.getZoom()) {
            this.rebuildEntityLayer(camera);
            this.lastZoom = camera.getZoom();
        }
    }

    private rebuildTerrainLayer() {
        const layer = this.world?.getLayerById(TerrainRenderLayer.LAYER_ID) as TerrainRenderLayer;
        layer.disposeWorldData();
        layer.setChunks(
            TerrainChunkBuilder.create(
                GameStateAccess.getTileContainer(),
                this.gl,
                layer.getShaderAttributes()!!,
            ),
        );
    }

    private rebuildEntityLayer(camera: Camera) {
        const layer = this.world?.getLayerById(EntityRenderLayer.LAYER_ID) as EntityRenderLayer;
        layer.disposeWorldData();
        layer.setMesh(
            EntityDataBuilder.create(
                this.gl,
                camera,
                GameStateAccess.getTiles(),
                GameStateAccess.getCities(),
                CommandStateAccess.getCommands(),
                layer.getShaderAttributes()!!,
                layer.getTextRenderer(),
            ),
        );
    }

}