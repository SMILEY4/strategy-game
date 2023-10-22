import {RenderWorld} from "./data/renderWorld";
import {TerrainRenderLayer} from "./layers/terrainRenderLayer";
import {TerrainChunkBuilder} from "./builders/terrainChunkBuilder";
import {GameStateAccess} from "../../../state/access/GameStateAccess";
import {EntityRenderLayer} from "./layers/entityRenderLayer";
import {EntityDataBuilder} from "./builders/entityDataBuilder";
import {CommandStateAccess} from "../../../state/access/CommandStateAccess";

export class WorldUpdater {

    private readonly world: RenderWorld;
    private readonly gl: WebGL2RenderingContext;
    private lastRevIdCommandState = "";

    constructor(gl: WebGL2RenderingContext, world: RenderWorld) {
        this.world = world;
        this.gl = gl;
    }


    public updateOnNextTurn() {
        this.rebuildEntityLayer();
        this.rebuildTerrainLayer();
    }

    public update() {
        if (CommandStateAccess.getRevId() !== this.lastRevIdCommandState) {
            this.lastRevIdCommandState = CommandStateAccess.getRevId();
            this.rebuildEntityLayer();
        }
    }

    private rebuildTerrainLayer() {
        const layer = this.world?.getLayerById(TerrainRenderLayer.LAYER_ID) as TerrainRenderLayer;
        layer.disposeWorldData();
        layer.setChunks(
            TerrainChunkBuilder.create(
                GameStateAccess.getTileContainer(),
                this.gl,
                this.world?.getLayers()[0].getShaderAttributes()!!,
            ),
        );
    }

    private rebuildEntityLayer() {
        const layer = this.world?.getLayerById(EntityRenderLayer.LAYER_ID) as EntityRenderLayer;
        layer.disposeWorldData();
        layer.setMesh(
            EntityDataBuilder.create(
                this.gl,
                GameStateAccess.getTiles(),
                GameStateAccess.getCities(),
                CommandStateAccess.getCommands(),
                this.world?.getLayers()[1].getShaderAttributes()!!),
        );
    }

}