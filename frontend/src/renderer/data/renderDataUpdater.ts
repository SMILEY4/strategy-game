import {RenderData} from "./renderData";
import {InstanceBaseDataBuilder} from "./builders/tilemap/instanceBaseDataBuilder";
import {InstanceOverlayDataBuilder} from "./builders/tilemap/instanceOverlayDataBuilder";
import {EntityMeshBuilder} from "./builders/entities/entityMeshBuilder";
import {RoutesMeshBuilder} from "./builders/routes/routesMeshBuilder";
import {TileRepository} from "../../state/access/TileRepository";
import {RouteRepository} from "../../state/access/RouteRepository";
import {RenderEntityCollector} from "./builders/entities/renderEntityCollector";
import {RemoteGameStateRepository} from "../../state/access/RemoteGameStateRepository";
import {ChangeDetector} from "../../shared/changeDetector";
import {CommandRepository} from "../../state/access/CommandRepository";
import {StampBuilder} from "./builders/stamps/stampBuilder";
import {Camera} from "../../shared/webgl/camera";
import {RenderEntity} from "./builders/entities/renderEntity";
import {LocalGameDatabase} from "../../state_new/localGameDatabase";

interface Changes {
    mapMode: boolean,
    remoteGameState: boolean,
    commands: boolean,
    camera: boolean,
}

export class RenderDataUpdater {

    private readonly remoteGameStateRepository: RemoteGameStateRepository;
    private readonly tileRepository: TileRepository;
    private readonly routesRepository: RouteRepository;
    private readonly localGameDb: LocalGameDatabase;
    private readonly commandRepository: CommandRepository;

    private readonly entityCollector: RenderEntityCollector;

    private readonly detectorRemoteGameStateRevId = new ChangeDetector();
    private readonly detectorCommandRevId = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();
    private readonly detectorCamera = new ChangeDetector();


    constructor(
        removeGameStateRepository: RemoteGameStateRepository,
        tileRepository: TileRepository,
        routesRepository: RouteRepository,
        localGameDb: LocalGameDatabase,
        commandRepository: CommandRepository,
        entityCollector: RenderEntityCollector,
    ) {
        this.remoteGameStateRepository = removeGameStateRepository;
        this.tileRepository = tileRepository;
        this.routesRepository = routesRepository;
        this.localGameDb = localGameDb;
        this.commandRepository = commandRepository;
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
        const mapMode = this.localGameDb.getMapMode();
        return {
            mapMode: this.detectorMapMode.check(mapMode),
            remoteGameState: this.detectorRemoteGameStateRevId.check(this.remoteGameStateRepository.getRevId()),
            commands: this.detectorCommandRevId.check(this.commandRepository.getRevId()),
            camera: this.detectorCamera.check(camera.getHash()),
        };
    }

    private updateMeta(renderData: RenderData) {
        const mapMode = this.localGameDb.getMapMode();
        const selectedTile = this.localGameDb.getSelectedTile();
        const mouseOverTile = this.localGameDb.getHoverTile();
        renderData.meta.mapMode = mapMode;
        renderData.meta.grayscale = mapMode.renderData.grayscale;
        renderData.meta.time = (renderData.meta.time + 1) % 10000;
        renderData.meta.tileSelected = selectedTile ? [selectedTile.q, selectedTile.r] : null;
        renderData.meta.tileMouseOver = mouseOverTile ? [mouseOverTile.q, mouseOverTile.r] : null;
    }

    private updateTilemapInstances(renderData: RenderData, changes: Changes) {
        if (changes.remoteGameState) {
            const [count, baseDataArray] = InstanceBaseDataBuilder.build(this.tileRepository.getTileContainer());
            renderData.tilemap.instances.instanceCount = count;
            renderData.tilemap.instances.instanceBaseBuffer.setData(baseDataArray, true);
        }
        if (changes.remoteGameState || changes.mapMode) {
            const mapMode = this.localGameDb.getMapMode();
            const [count, overlayDataArray] = InstanceOverlayDataBuilder.build(this.tileRepository.getTileContainer(), mapMode);
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
            const [count, vertices] = RoutesMeshBuilder.build(this.routesRepository.getRoutes());
            renderData.routes.vertexCount = count;
            renderData.routes.vertexBuffer.setData(vertices, true);
        }
    }

    private updateStamps(renderData: RenderData, camera: Camera, entities: RenderEntity[], changes: Changes) {
        if (changes.remoteGameState || changes.commands || changes.mapMode || changes.camera) {
            renderData.stamps.items = StampBuilder.build(camera, entities, this.tileRepository.getTileContainer(), this.localGameDb.getMapMode());
            renderData.stamps.dirty = true;
        } else {
            renderData.stamps.dirty = false;
        }
    }

}