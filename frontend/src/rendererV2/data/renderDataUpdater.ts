import {RenderData} from "./renderData";
import {ChangeDetector} from "../../shared/changeDetector";
import {Camera} from "../../shared/webgl/camera";
import {CommandDatabase} from "../../state/commandDatabase";
import {RouteDatabase} from "../../state/routeDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {RenderEntityCollector} from "../../renderer/data/builders/entities/renderEntityCollector";
import {GroundInstanceBaseDataBuilder} from "./builders/ground/groundInstanceBaseDataBuilder";
import {WaterInstanceBaseDataBuilder} from "./builders/water/waterInstanceBaseDataBuilder";
import {DetailMeshDataBuilder} from "./builders/detail/detailInstanceBaseDataBuilder";
import {OverlayInstanceBaseDataBuilder} from "./builders/overlay/overlayInstanceBaseDataBuilder";

interface Changes {
    currentTurnChanged: boolean,
    mapMode: boolean,
    changeGameSession: boolean,
    commands: boolean,
    camera: boolean,
}

export class RenderDataUpdater {

    private readonly gameSessionDb: GameSessionDatabase;
    private readonly tileDb: TileDatabase;
    private readonly commandDb: CommandDatabase;


    private readonly detectorRemoteGameStateRevId = new ChangeDetector();
    private readonly detectorCommandRevId = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();
    private readonly detectorCamera = new ChangeDetector();
    private readonly detectorCurrentTurn = new ChangeDetector();


    constructor(
        gameSessionDb: GameSessionDatabase,
        tileDb: TileDatabase,
        routeDb: RouteDatabase,
        commandDb: CommandDatabase,
        entityCollector: RenderEntityCollector,
    ) {
        this.gameSessionDb = gameSessionDb;
        this.tileDb = tileDb;
        this.commandDb = commandDb;
    }

    public update(renderData: RenderData, camera: Camera) {
        const changes = this.findChanges(camera);
        this.updateMeta(renderData);
        this.updateTilemapInstances(renderData, changes);
    }

    private findChanges(camera: Camera): Changes {
        const mapMode = this.gameSessionDb.getMapMode();
        return {
            currentTurnChanged: this.detectorCurrentTurn.check(this.gameSessionDb.get().turn),
            mapMode: this.detectorMapMode.check(mapMode),
            changeGameSession: this.detectorRemoteGameStateRevId.check(this.gameSessionDb.getRevId()),
            commands: this.detectorCommandRevId.check(this.commandDb.getRevId()),
            camera: this.detectorCamera.check(camera.getHash()),
        };
    }

    private updateMeta(renderData: RenderData) {
        const mapMode = this.gameSessionDb.getMapMode();
        const selectedTile = this.gameSessionDb.getSelectedTile();
        const mouseOverTile = this.gameSessionDb.getHoverTile();
        renderData.meta.mapMode = mapMode;
        renderData.meta.grayscale = mapMode.renderData.grayscale;
        renderData.meta.time = (renderData.meta.time + 1) % 10000;
        renderData.meta.tileSelected = selectedTile ? [selectedTile.q, selectedTile.r] : null;
        renderData.meta.tileMouseOver = mouseOverTile ? [mouseOverTile.q, mouseOverTile.r] : null;
    }

    private updateTilemapInstances(renderData: RenderData, changes: Changes) {
        if (changes.currentTurnChanged) {
            const [count, baseDataArray] = GroundInstanceBaseDataBuilder.build(this.tileDb);
            renderData.ground.instances.instanceCount = count;
            renderData.ground.instances.instanceBuffer.setData(baseDataArray, true);
        }
        if (changes.currentTurnChanged) {
            const [count, baseDataArray] = WaterInstanceBaseDataBuilder.build(this.tileDb);
            renderData.water.instances.instanceCount = count;
            renderData.water.instances.instanceBuffer.setData(baseDataArray, true);
        }
        if (changes.currentTurnChanged) {
            const [count, baseDataArray] = DetailMeshDataBuilder.build(this.tileDb)
            renderData.details.vertexCount = count
            renderData.details.vertexBuffer.setData(baseDataArray, true)
        }
        if (changes.currentTurnChanged) {
            const [count, baseDataArray] = OverlayInstanceBaseDataBuilder.build(this.tileDb);
            renderData.overlay.instances.instanceCount = count;
            renderData.overlay.instances.instanceBuffer.setData(baseDataArray, true);
        }
    }

}