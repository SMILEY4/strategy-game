import {RenderData} from "./renderData";
import {InstanceBaseDataBuilder} from "./builders/tilemap/instanceBaseDataBuilder";
import {InstanceOverlayDataBuilder} from "./builders/tilemap/instanceOverlayDataBuilder";
import {EntityMeshBuilder} from "./builders/entities/entityMeshBuilder";
import {RoutesMeshBuilder} from "./builders/routes/routesMeshBuilder";
import {RenderEntityCollector} from "./builders/entities/renderEntityCollector";
import {ChangeDetector} from "../../shared/changeDetector";
import {StampBuilder} from "./builders/stamps/stampBuilder";
import {Camera} from "../../shared/webgl/camera";
import {RenderEntity} from "./builders/entities/renderEntity";
import {CommandDatabase} from "../../state/commandDatabase";
import {RouteDatabase} from "../../state/routeDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";

interface Changes {
    mapMode: boolean,
    remoteGameState: boolean,
    commands: boolean,
    camera: boolean,
}

export class RenderDataUpdater {

    private readonly gameSessionDb: GameSessionDatabase;
    private readonly tileDb: TileDatabase;
    private readonly routeDb: RouteDatabase;
    private readonly commandDb: CommandDatabase;

    private readonly entityCollector: RenderEntityCollector;

    private readonly detectorRemoteGameStateRevId = new ChangeDetector();
    private readonly detectorCommandRevId = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();
    private readonly detectorCamera = new ChangeDetector();


    constructor(
        gameSessionDb: GameSessionDatabase,
        tileDb: TileDatabase,
        routeDb: RouteDatabase,
        commandDb: CommandDatabase,
        entityCollector: RenderEntityCollector,
    ) {
        this.gameSessionDb = gameSessionDb;
        this.tileDb = tileDb;
        this.routeDb = routeDb;
        this.commandDb = commandDb;
        this.entityCollector = entityCollector;
    }

    public update(renderData: RenderData, camera: Camera) {
        const changes = this.findChanges(camera);
        this.updateMeta(renderData);
        this.updateTilemapInstances(renderData, changes);
        const entities = this.updateEntities(renderData, changes);
        this.updateRoutes(renderData, changes);
        this.updateStamps(renderData, camera, entities, changes);
    }

    private findChanges(camera: Camera): Changes {
        const mapMode = this.gameSessionDb.getMapMode();
        return {
            mapMode: this.detectorMapMode.check(mapMode),
            remoteGameState: this.detectorRemoteGameStateRevId.check(this.gameSessionDb.getRevId()),
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
        if (changes.remoteGameState) {
            const [count, baseDataArray] = InstanceBaseDataBuilder.build(this.tileDb);
            renderData.tilemap.instances.instanceCount = count;
            renderData.tilemap.instances.instanceBaseBuffer.setData(baseDataArray, true);
        }
        if (changes.remoteGameState || changes.mapMode) {
            const mapMode = this.gameSessionDb.getMapMode();
            const [count, overlayDataArray] = InstanceOverlayDataBuilder.build(this.tileDb, mapMode);
            renderData.tilemap.instances.instanceCount = count;
            renderData.tilemap.instances.instanceOverlayBuffer.setData(overlayDataArray, true);
        }
    }

    private updateEntities(renderData: RenderData, changes: Changes): RenderEntity[] {
        if (changes.remoteGameState || changes.commands) {
            const entities = this.entityCollector.collect();
            const [count, vertices] = EntityMeshBuilder.build(entities);
            renderData.entities.items = entities;
            renderData.entities.vertexCount = count;
            renderData.entities.vertexBuffer.setData(vertices, true);
            return entities;
        } else {
            return renderData.entities.items;
        }
    }

    private updateRoutes(renderData: RenderData, changes: Changes) {
        if (changes.remoteGameState) {
            const [count, vertices] = RoutesMeshBuilder.build(this.routeDb.queryMany(RouteDatabase.QUERY_ALL, null));
            renderData.routes.vertexCount = count;
            renderData.routes.vertexBuffer.setData(vertices, true);
        }
    }

    private updateStamps(renderData: RenderData, camera: Camera, entities: RenderEntity[], changes: Changes) {
        if (changes.remoteGameState || changes.commands || changes.mapMode || changes.camera) {
            renderData.stamps.items = StampBuilder.build(camera, entities, this.tileDb, this.gameSessionDb.getMapMode());
            renderData.stamps.dirty = true;
        } else {
            renderData.stamps.dirty = false;
        }
    }

}