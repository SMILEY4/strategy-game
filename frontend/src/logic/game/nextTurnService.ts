import {
    CityTileObjectMessage,
    DetailLogEntryMessage,
    GameStateMessage,
    MarkerTileObjectMessage,
    ResourceLedgerEntryMessage,
    ScoutTileObjectMessage,
    TileMessage,
} from "./models/gameStateMessage";
import {GameLoopService} from "./gameLoopService";
import {ValueHistory} from "../../shared/valueHistory";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {CityDatabase} from "../../state/cityDatabase";
import {CountryDatabase} from "../../state/countryDatabase";
import {ProvinceDatabase} from "../../state/provinceDatabase";
import {RouteDatabase} from "../../state/routeDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {MonitoringRepository} from "../../state/monitoringRepository";
import {Transaction} from "../../shared/db/database/transaction";
import {Country} from "../../models/country";
import {HiddenType, mapHidden} from "../../models/hiddenType";
import {Province} from "../../models/province";
import {ResourceType} from "../../models/resourceType";
import {City} from "../../models/city";
import {SettlementTier} from "../../models/settlementTier";
import {BuildingProductionQueueEntry, SettlerProductionQueueEntry} from "../../models/productionQueueEntry";
import {BuildingType} from "../../models/buildingType";
import {DetailLogEntry} from "../../models/detailLogEntry";
import {mapRecord} from "../../shared/utils";
import {Tile} from "../../models/tile";
import {TerrainType} from "../../models/terrainType";
import {TerrainResourceType} from "../../models/terrainResourceType";
import {TileVisibility} from "../../models/tileVisibility";
import {Route} from "../../models/route";
import {ResourceLedger} from "../../models/resourceLedger";

export class NextTurnService {

    private readonly gameLoopService: GameLoopService;

    private readonly monitoringRepository: MonitoringRepository;

    private readonly gameSessionDb: GameSessionDatabase;
    private readonly cityDb: CityDatabase;
    private readonly countryDb: CountryDatabase;
    private readonly provinceDb: ProvinceDatabase;
    private readonly routeDb: RouteDatabase;
    private readonly tileDb: TileDatabase;

    private readonly durationHistory = new ValueHistory(10);

    constructor(
        gameLoopService: GameLoopService,
        gameSessionDb: GameSessionDatabase,
        monitoringRepository: MonitoringRepository,
        cityDb: CityDatabase,
        countryDb: CountryDatabase,
        provinceDb: ProvinceDatabase,
        routeDb: RouteDatabase,
        tileDb: TileDatabase,
    ) {
        this.gameLoopService = gameLoopService;
        this.gameSessionDb = gameSessionDb;
        this.monitoringRepository = monitoringRepository;
        this.cityDb = cityDb;
        this.countryDb = countryDb;
        this.provinceDb = provinceDb;
        this.routeDb = routeDb;
        this.tileDb = tileDb;
    }

    public handleNextTurn(game: GameStateMessage) {
        const timeStart = Date.now();

        Transaction.run([this.countryDb, this.provinceDb, this.cityDb, this.tileDb, this.routeDb, this.gameSessionDb], () => {

            this.countryDb.deleteAll();
            this.provinceDb.deleteAll();
            this.cityDb.deleteAll();
            this.tileDb.deleteAll();
            this.routeDb.deleteAll();

            this.tileDb.insertMany(this.buildTiles(game));
            this.countryDb.insertMany(this.buildCountries(game));
            this.provinceDb.insertMany(this.buildProvinces(game));
            this.cityDb.insertMany(this.buildCities(game));
            this.routeDb.insertMany(this.buildRoutes(game));

            this.gameSessionDb.setTurn(game.meta.turn);

            if (this.gameSessionDb.getState() === "loading") {
                this.gameSessionDb.setState("playing");
            }

        });

        this.gameLoopService.onGameStateUpdate();

        const timeEnd = Date.now();
        this.durationHistory.set(timeEnd - timeStart);
        this.monitoringRepository.setNextTurnDurations(this.durationHistory.getHistory());
    }


    private buildTiles(game: GameStateMessage): Tile[] {
        return game.tiles.map(tileMsg => {
            if (tileMsg.visibility === "UNKNOWN") {
                return this.buildUnknownTile(tileMsg);
            } else {
                return this.buildKnownTile(tileMsg, game);
            }
        });
    }


    private buildUnknownTile(tileMsg: TileMessage): Tile {
        const tile: Tile = {
            identifier: tileMsg.identifier,
            visibility: TileVisibility.fromString(tileMsg.visibility),
            basic: {
                terrainType: HiddenType.hidden(),
                resourceType: HiddenType.hidden(),
            },
            political: {
                owner: HiddenType.hidden(),
                influences: HiddenType.hidden(),
            },
            objects: HiddenType.hidden(),
        };
        return tile;
    }

    private buildKnownTile(tileMsg: TileMessage, game: GameStateMessage): Tile {
        const tile: Tile = {
            identifier: tileMsg.identifier,
            visibility: TileVisibility.fromString(tileMsg.visibility),
            basic: {
                terrainType: mapHidden(tileMsg.base.terrainType, type => TerrainType.fromString(type)),
                resourceType: mapHidden(tileMsg.base.resourceType, type => TerrainResourceType.fromString(type)),
            },
            political: {
                owner: mapHidden(tileMsg.political.owner, ownerMsg => {
                    if (ownerMsg) {
                        return {
                            country: game.identifiers.countries[ownerMsg.country],
                            province: game.identifiers.provinces[ownerMsg.province],
                            city: ownerMsg.city ? game.identifiers.cities[ownerMsg.city] : null,
                        };
                    } else {
                        return null;
                    }
                }),
                influences: mapHidden(tileMsg.political.influences, influencesMsg => {
                    return influencesMsg.map(influenceMsg => ({
                        country: game.identifiers.countries[influenceMsg.country],
                        province: game.identifiers.provinces[influenceMsg.province],
                        city: game.identifiers.cities[influenceMsg.city],
                        amount: influenceMsg.amount,
                    }));
                }),
            },
            objects: mapHidden(tileMsg.objects, objectsMsg => {
                return objectsMsg.map(objectMsg => {
                    switch (objectMsg.type) {
                        case "marker": {
                            return {
                                type: objectMsg.type,
                                country: game.identifiers.countries[objectMsg.country],
                                label: (objectMsg as MarkerTileObjectMessage).label,
                            };
                        }
                        case "scout": {
                            return {
                                type: "scout",
                                country: game.identifiers.countries[objectMsg.country],
                                creationTurn: (objectMsg as ScoutTileObjectMessage).creationTurn,
                            };
                        }
                        case "city": {
                            return {
                                type: "city",
                                country: game.identifiers.countries[objectMsg.country],
                                city: game.identifiers.cities[(objectMsg as CityTileObjectMessage).city],
                            };
                        }
                        default: {
                            throw new Error("unknown tile object type: " + objectMsg.type);
                        }
                    }
                });
            }),
        };
        return tile;
    }

    private buildCountries(game: GameStateMessage): Country[] {
        return game.countries.map(countryMsg => ({
            identifier: game.identifiers.countries[countryMsg.id],
            player: countryMsg.player,
            isPlayerOwned: countryMsg.isPlayerOwned,
            settlers: countryMsg.availableSettlers,
            provinces: countryMsg.provinces.map(provinceMsg => ({
                identifier: game.identifiers.provinces[provinceMsg.id],
                cities: provinceMsg.cities.map(cityMsg => ({
                    identifier: game.identifiers.cities[cityMsg.id],
                    isProvinceCapitol: cityMsg.isProvinceCapitol,
                    isCountryCapitol: false,
                })),
            })),
        }));
    }

    private buildProvinces(game: GameStateMessage): Province[] {
        return game.provinces.map(provinceMsg => ({
            identifier: game.identifiers.provinces[provinceMsg.id],
            country: game.identifiers.countries[provinceMsg.country],
            isPlayerOwned: provinceMsg.isPlayerOwned,
            cities: provinceMsg.cities.map(cityMsg => ({
                identifier: game.identifiers.cities[cityMsg.id],
                isProvinceCapitol: cityMsg.isProvinceCapitol,
                isCountryCapitol: false,
            })),
            resourceLedger: mapHidden(provinceMsg.resources, resources => this.convertResourceLedger(resources)),
        }));
    }

    private buildCities(game: GameStateMessage): City[] {
        return game.cities.map(cityMsg => ({
            identifier: game.identifiers.cities[cityMsg.id],
            country: game.identifiers.countries[cityMsg.country],
            province: game.identifiers.provinces[cityMsg.province],
            tile: cityMsg.tile,
            isPlayerOwned: cityMsg.isPlayerOwned,
            isCountryCapital: false,
            isProvinceCapital: cityMsg.isProvinceCapital,
            tier: SettlementTier.fromString(cityMsg.tier),
            population: {
                size: cityMsg.population.size,
                growth: mapHidden(cityMsg.population.growth, growthMsg => ({
                    progress: growthMsg.progress,
                    details: this.convertDetails(growthMsg.details),
                })),
            },
            buildings: mapHidden(cityMsg.infrastructure.buildings, buildingsMsg => {
                return buildingsMsg.map(buildingMsg => ({
                    type: BuildingType.fromString(buildingMsg.type),
                    active: buildingMsg.active,
                    tile: buildingMsg.tile,
                    details: this.convertDetails(buildingMsg.details),
                }));
            }),
            productionQueue: mapHidden(cityMsg.infrastructure.productionQueue, productionQueue => {
                return productionQueue.map(entryMsg => {
                    switch (entryMsg.type) {
                        case "building": {
                            return new BuildingProductionQueueEntry(
                                entryMsg.entryId,
                                entryMsg.progress,
                                BuildingType.fromString(entryMsg.buildingType!),
                            );
                        }
                        case "settler": {
                            return new SettlerProductionQueueEntry(
                                entryMsg.entryId,
                                entryMsg.progress,
                            );
                        }
                        default: {
                            throw new Error("unknown production queue entry type: " + entryMsg.type);
                        }
                    }
                });
            }),
            connectedCities: cityMsg.connectedCities.map(connectedMsg => ({
                city: game.identifiers.cities[connectedMsg.city],
                route: connectedMsg.route,
                distance: connectedMsg.distance,
            })),
        }));
    }

    private buildRoutes(game: GameStateMessage): Route[] {
        return game.routes.map(routeMsg => ({
            routeId: routeMsg.id,
            cityA: mapHidden(routeMsg.cityA, id => game.identifiers.cities[id]),
            cityB: mapHidden(routeMsg.cityB, id => game.identifiers.cities[id]),
            path: routeMsg.path,
        }));
    }

    private convertResourceLedger(entries: ResourceLedgerEntryMessage[]): ResourceLedger {
        return {
            entries: entries.map(e => ({
                resourceType: ResourceType.fromString(e.type),
                amount: e.amount,
                missing: e.missing,
                details: this.convertDetails(e.details),
            })),
        };
    }

    private convertDetails<T>(entries: DetailLogEntryMessage<T>[]): DetailLogEntry<T>[] {
        return entries.map(entry => ({
            id: entry.id,
            data: mapRecord(entry.data, (_, value) => value.value),
        }));
    }

}