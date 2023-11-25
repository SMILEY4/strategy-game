import {RenderData} from "./renderData";
import {MapMode} from "../../models/mapMode";
import {InstanceBaseDataBuilder} from "./builders/tilemap/instanceBaseDataBuilder";
import {InstanceOverlayDataBuilder} from "./builders/tilemap/instanceOverlayDataBuilder";
import {EntityMeshBuilder} from "./builders/entities/entityMeshBuilder";
import {RoutesMeshBuilder} from "./builders/routes/routesMeshBuilder";
import {TileRepository} from "../../state/access/TileRepository";
import {RouteRepository} from "../../state/access/RouteRepository";
import {MapModeRepository} from "../../state/access/MapModeRepository";
import {RenderEntityCollector} from "./builders/entities/renderEntityCollector";
import {RemoteGameStateRepository} from "../../state/access/RemoteGameStateRepository";
import {ChangeDetector} from "../../shared/changeDetector";
import {CommandRepository} from "../../state/access/CommandRepository";

interface Changes {
    mapMode: boolean,
    remoteGameStateRevId: boolean,
    commands: boolean,
}

export class RenderDataUpdater {

    private readonly remoteGameStateRepository: RemoteGameStateRepository;
    private readonly tileRepository: TileRepository;
    private readonly routesRepository: RouteRepository;
    private readonly mapModeRepository: MapModeRepository;
    private readonly commandRepository: CommandRepository;
    private readonly entityCollector: RenderEntityCollector;

    private readonly detectorRemoteGameStateRevId = new ChangeDetector();
    private readonly detectorCommandRevId = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();


    constructor(
        removeGameStateRepository: RemoteGameStateRepository,
        tileRepository: TileRepository,
        routesRepository: RouteRepository,
        mapModeRepository: MapModeRepository,
        commandRepository: CommandRepository,
        entityCollector: RenderEntityCollector,
    ) {
        this.remoteGameStateRepository = removeGameStateRepository;
        this.tileRepository = tileRepository;
        this.routesRepository = routesRepository;
        this.mapModeRepository = mapModeRepository;
        this.commandRepository = commandRepository;
        this.entityCollector = entityCollector;
    }

    public update(renderData: RenderData) {
        const changes = this.findChanges()
        this.updateMeta(renderData);
        this.updateTilemapInstances(renderData, changes);
        this.updateEntities(renderData, changes);
        this.updateRoutes(renderData, changes);
    }

    private findChanges(): Changes {
        const mapMode = this.mapModeRepository.getMapMode();
        return {
            mapMode: this.detectorMapMode.check(mapMode),
            remoteGameStateRevId: this.detectorRemoteGameStateRevId.check(this.remoteGameStateRepository.getRevId()),
            commands: this.detectorCommandRevId.check(this.commandRepository.getRevId())
        };
    }

    private updateMeta(renderData: RenderData) {
        const mapMode = this.mapModeRepository.getMapMode();
        const selectedTile = this.tileRepository.getSelectedTile();
        const mouseOverTile = this.tileRepository.getHoverTile();
        renderData.meta.mapMode = mapMode;
        renderData.meta.grayscale = mapMode.renderData.grayscale;
        renderData.meta.time = (renderData.meta.time + 1) % 10000;
        renderData.meta.tileSelected = selectedTile ? [selectedTile.q, selectedTile.r] : null;
        renderData.meta.tileMouseOver = mouseOverTile ? [mouseOverTile.q, mouseOverTile.r] : null;
    }

    private updateTilemapInstances(renderData: RenderData, changes: Changes) {
        if (changes.remoteGameStateRevId) {
            const [count, baseDataArray] = InstanceBaseDataBuilder.build(this.tileRepository.getTileContainer());
            renderData.tilemap.instances.instanceCount = count;
            renderData.tilemap.instances.instanceBaseBuffer.setData(baseDataArray, true);
        }
        if (changes.remoteGameStateRevId || changes.mapMode) {
            const mapMode = this.mapModeRepository.getMapMode();
            const [count, overlayDataArray] = InstanceOverlayDataBuilder.build(this.tileRepository.getTileContainer(), mapMode);
            renderData.tilemap.instances.instanceCount = count;
            renderData.tilemap.instances.instanceOverlayBuffer.setData(overlayDataArray, true);
        }
    }

    private updateEntities(renderData: RenderData, changes: Changes) {
        if (changes.remoteGameStateRevId || changes.commands) {
            const entities = this.entityCollector.collect();
            const [count, vertices] = EntityMeshBuilder.build(entities);
            renderData.entities.items = entities;
            renderData.entities.vertexCount = count;
            renderData.entities.vertexBuffer.setData(vertices, true);
        }
    }

    private updateRoutes(renderData: RenderData, changes: Changes) {
        if (changes.remoteGameStateRevId) {
            const [count, vertices] = RoutesMeshBuilder.build(this.routesRepository.getRoutes());
            renderData.routes.vertexCount = count;
            renderData.routes.vertexBuffer.setData(vertices, true);
        }
    }

}