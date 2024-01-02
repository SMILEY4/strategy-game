import {
    CityTileObjectMessage,
    DetailLogEntryMessage,
    GameStateMessage,
    MarkerTileObjectMessage,
    ScoutTileObjectMessage,
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
import {getHiddenOrNull, mapHiddenOrDefault, mapHiddenOrNull} from "../../models/hiddenType";
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
import {Visibility} from "../../models/visibility";
import {Route} from "../../models/route";

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
        return game.tiles.map(tileMsg => ({
            identifier: tileMsg.identifier,
            terrainType: mapHiddenOrNull(tileMsg.base.terrainType, type => TerrainType.fromString(type)),
            resourceType: mapHiddenOrNull(tileMsg.base.resourceType, type => TerrainResourceType.fromString(type)),
            visibility: Visibility.fromString(tileMsg.visibility),
            owner: mapHiddenOrNull(tileMsg.political.owner, ownerMsg => {
                if(ownerMsg) {
                    return {
                        country: game.identifiers.countries[ownerMsg.country],
                        province: game.identifiers.provinces[ownerMsg.province],
                        city: ownerMsg.city ? game.identifiers.cities[ownerMsg.city] : null
                    }
                } else {
                    return  null
                }
            }),
            influences: mapHiddenOrDefault(tileMsg.political.influences, [], influencesMsg => {
                return influencesMsg.map(influenceMsg => ({
                    country: game.identifiers.countries[influenceMsg.country],
                    province: game.identifiers.provinces[influenceMsg.province],
                    city: game.identifiers.cities[influenceMsg.city],
                    amount: influenceMsg.amount
                }))
            }),
            objects: mapHiddenOrDefault(tileMsg.objects, [], objectsMsg => {
                return objectsMsg.map(objectMsg => {
                    switch (objectMsg.type) {
                        case "marker":{
                            return {
                                type: objectMsg.type,
                                country: game.identifiers.countries[objectMsg.countryId],
                                label: (objectMsg as MarkerTileObjectMessage).label
                            }
                        }
                        case "scout":{
                            return {
                                type: "scout",
                                country: game.identifiers.countries[objectMsg.countryId],
                                creationTurn: (objectMsg as ScoutTileObjectMessage).creationTurn
                            }
                        }
                        case "city": {
                            return {
                                type: "city",
                                country: game.identifiers.countries[objectMsg.countryId],
                                city: game.identifiers.cities[(objectMsg as CityTileObjectMessage).cityId]
                            }
                        }
                        default: {
                            throw new Error("unknown tile object type: " + objectMsg.type);
                        }
                    }
                })
            }),
        }))
    }

    private buildCountries(game: GameStateMessage): Country[] {
        return game.countries.map(countryMsg => ({
            identifier: game.identifiers.countries[countryMsg.id],
            player: countryMsg.player,
            settlers: getHiddenOrNull(countryMsg.availableSettlers),
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
            cities: provinceMsg.cities.map(cityMsg => ({
                identifier: game.identifiers.cities[cityMsg.id],
                isProvinceCapitol: cityMsg.isProvinceCapitol,
                isCountryCapitol: false,
            })),
            resourceLedger: mapHiddenOrNull(provinceMsg.resources, resources => ({
                entries: resources.map(resource => ({
                    resourceType: ResourceType.fromString(resource.type),
                    amount: resource.amount,
                    missing: resource.missing,
                    details: resource.details,
                })),
            })),
        }));
    }

    private buildCities(game: GameStateMessage): City[] {
        return game.cities.map(cityMsg => ({
            identifier: game.identifiers.cities[cityMsg.id],
            country: game.identifiers.countries[cityMsg.id],
            province: game.identifiers.provinces[cityMsg.id],
            tile: cityMsg.tile,
            isCountryCapital: false,
            isProvinceCapital: cityMsg.isProvinceCapital,
            tier: SettlementTier.fromString(cityMsg.tier),
            population: {
                size: getHiddenOrNull(cityMsg.population.size),
                progress: null as any, // todo
                growthDetails: null as any, // todo
            },
            buildings: mapHiddenOrDefault(cityMsg.infrastructure.buildings, [], buildingsMsg => {
                return buildingsMsg.map(buildingMsg => ({
                    type: BuildingType.fromString(buildingMsg.type),
                    active: buildingMsg.active,
                    tile: buildingMsg.tile,
                    details: this.convertDetails(buildingMsg.details)
                }));
            }),
            productionQueue: mapHiddenOrDefault(cityMsg.infrastructure.productionQueue, [], productionQueue => {
                return productionQueue.map(entryMsg => {
                    switch (entryMsg.type) {
                        case "building": {
                            return new BuildingProductionQueueEntry(
                                entryMsg.entryId,
                                entryMsg.progress,
                                BuildingType.fromString(entryMsg.buildingType!)
                            )
                        }
                        case "settler": {
                            return new SettlerProductionQueueEntry(
                                entryMsg.entryId,
                                entryMsg.progress,
                            )
                        }
                        default: {
                            throw new Error("unknown production queue entry type: " + entryMsg.type);
                        }
                    }
                });
            }),
        }));
    }

    private buildRoutes(game: GameStateMessage): Route[] {
        return game.routes.map(routeMsg => ({
            routeId: routeMsg.id,
            cityA: mapHiddenOrNull(routeMsg.cityA, id => game.identifiers.cities[id]),
            cityB: mapHiddenOrNull(routeMsg.cityB, id => game.identifiers.cities[id]),
            path: routeMsg.path
        }))
    }

    private convertDetails<T>(entries: DetailLogEntryMessage<T>[]): DetailLogEntry<T>[] {
        return entries.map(entry => ({
            id: entry.id,
            data: mapRecord(entry.data, (_, value) => value.value),
        }));
    }

    // handleNextTurn(game: GameStateMessage) {
    //     const timeStart = Date.now();
    //
    //     // todo: possible performance optimisation:
    //     //  object pools for tiles, cities, ...
    //     //  move old game state to pool instead of gc -> allocate new state from pool
    //
    //     Transaction.run([this.countryDb, this.provinceDb, this.cityDb, this.tileDb, this.routeDb, this.gameSessionDb], () => {
    //         this.countryDb.deleteAll();
    //         this.provinceDb.deleteAll();
    //         this.cityDb.deleteAll();
    //         this.tileDb.deleteAll();
    //         this.routeDb.deleteAll();
    //
    //         this.countryDb.insertMany(this.buildCountries(game));
    //         this.provinceDb.insertMany(this.buildProvinces(game));
    //         this.cityDb.insertMany(this.buildCities(game));
    //         this.tileDb.insertMany(this.buildTiles(game));
    //         this.routeDb.insertMany(this.buildRoutes(game));
    //         this.gameSessionDb.setTurn(game.game.turn);
    //         if (this.gameSessionDb.getState() === "loading") {
    //             this.gameSessionDb.setState("playing");
    //         }
    //     });
    //
    //     this.gameLoopService.onGameStateUpdate();
    //
    //     const timeEnd = Date.now();
    //     this.durationHistory.set(timeEnd - timeStart);
    //     this.monitoringRepository.setNextTurnDurations(this.durationHistory.getHistory());
    // }
    //
    // private buildCountries(game: GameStateMessage): Country[] {
    //     return game.game.countries.map(countryDTO => {
    //         return {
    //             identifier: {
    //                 id: countryDTO.dataTier1.id,
    //                 name: countryDTO.dataTier1.name,
    //                 color: countryDTO.dataTier1.color,
    //             },
    //             player: {
    //                 userId: countryDTO.dataTier1.userId,
    //                 name: countryDTO.dataTier1.userName,
    //             },
    //             settlers: orNull(countryDTO.dataTier3?.availableSettlers),
    //             provinces: game.game.provinces
    //                 .filter(provinceDTO => provinceDTO.dataTier1.countryId === countryDTO.dataTier1.id)
    //                 .map(msgProvince => {
    //                     return {
    //                         identifier: {
    //                             id: msgProvince.dataTier1.id,
    //                             name: msgProvince.dataTier1.name,
    //                             color: msgProvince.dataTier1.color,
    //                         },
    //                         cities: msgProvince.dataTier1.cityIds.map(dtoCityId => {
    //                             const cityDTO = this.findDTOCityByIdOrNull(game, dtoCityId)!!;
    //                             return {
    //                                 identifier: {
    //                                     id: cityDTO.dataTier1.id,
    //                                     name: cityDTO.dataTier1.name,
    //                                     color: cityDTO.dataTier1.color,
    //                                 },
    //                                 isCountryCapitol: false,
    //                                 isProvinceCapitol: cityDTO.dataTier1.isProvinceCapital,
    //                             };
    //                         }),
    //                     };
    //                 }),
    //         };
    //     });
    // }
    //
    // private buildProvinces(game: GameStateMessage): Province[] {
    //     return game.game.provinces.map(provinceDTO => {
    //         return {
    //             identifier: {
    //                 id: provinceDTO.dataTier1.id,
    //                 name: provinceDTO.dataTier1.name,
    //                 color: provinceDTO.dataTier1.color,
    //             },
    //             country: this.findCountry(game, provinceDTO.dataTier1.countryId),
    //             cities: provinceDTO.dataTier1.cityIds.map(dtoCityId => {
    //                 const cityDTO = this.findDTOCityByIdOrNull(game, dtoCityId)!!;
    //                 return {
    //                     identifier: {
    //                         id: cityDTO.dataTier1.id,
    //                         name: cityDTO.dataTier1.name,
    //                         color: cityDTO.dataTier1.color,
    //                     },
    //                     isCountryCapitol: false,
    //                     isProvinceCapitol: cityDTO.dataTier1.isProvinceCapital,
    //                 };
    //             }),
    //             resourceLedger: provinceDTO.dataTier3 ? this.buildResourceLedger(provinceDTO.dataTier3.resourceLedger) : null,
    //         };
    //     });
    // }
    //
    // private buildResourceLedger(dto: ResourceLedgerDTO): ResourceLedger {
    //     return {
    //         entries: dto.entries.map(dtoEntry => ({
    //             resourceType: ResourceType.fromString(dtoEntry.resourceType),
    //             amount: dtoEntry.amount,
    //             missing: dtoEntry.missing,
    //             details: this.convertDetails(dtoEntry.details),
    //         })),
    //     };
    // }
    //
    // private buildCities(game: GameStateMessage): City[] {
    //     return game.game.cities.map(cityDTO => {
    //         return {
    //             identifier: {
    //                 id: cityDTO.dataTier1.id,
    //                 name: cityDTO.dataTier1.name,
    //                 color: cityDTO.dataTier1.color,
    //             },
    //             country: this.findCountry(game, cityDTO.dataTier1.countryId),
    //             province: this.findProvinceByCity(game, cityDTO.dataTier1.id),
    //             tile: {
    //                 id: cityDTO.dataTier1.tile.tileId,
    //                 q: cityDTO.dataTier1.tile.q,
    //                 r: cityDTO.dataTier1.tile.r,
    //             },
    //             isCountryCapital: cityDTO.dataTier1.isCountryCapital,
    //             isProvinceCapital: cityDTO.dataTier1.isProvinceCapital,
    //             tier: SettlementTier.fromString(cityDTO.dataTier1.tier),
    //             population: {
    //                 size: orNull(cityDTO.dataTier3?.size),
    //                 progress: orNull(cityDTO.dataTier3?.growthProgress),
    //                 growthDetails: cityDTO.dataTier3 ? this.convertDetails(cityDTO.dataTier3.growthDetails) : [],
    //             },
    //             productionQueue: cityDTO.dataTier3
    //                 ? cityDTO.dataTier3.productionQueue.map(queueEntryDTO => this.buildProductionEntry(queueEntryDTO))
    //                 : [],
    //             buildings: cityDTO.dataTier3
    //                 ? cityDTO.dataTier3.buildings.map(buildingDTO => this.buildBuilding(buildingDTO))
    //                 : [],
    //         };
    //     });
    // }
    //
    // private buildProductionEntry(entryDTO: ProductionQueueEntryDTO): ProductionQueueEntry {
    //     switch (entryDTO.type) {
    //         case "settler":
    //             return new SettlerProductionQueueEntry(entryDTO.entryId, entryDTO.progress);
    //         case "building":
    //             return new BuildingProductionQueueEntry(entryDTO.entryId, entryDTO.progress, BuildingType.fromString(entryDTO.buildingType!));
    //     }
    // }
    //
    // private buildBuilding(buildingDTO: BuildingDTO): Building {
    //     return {
    //         type: BuildingType.fromString(buildingDTO.type),
    //         active: buildingDTO.active,
    //         tile: buildingDTO.tile ? {
    //             id: buildingDTO.tile.tileId,
    //             q: buildingDTO.tile.q,
    //             r: buildingDTO.tile.r,
    //         } : null,
    //         details: this.convertDetails(buildingDTO.details),
    //     };
    // }
    //
    // private buildTiles(game: GameStateMessage): Tile[] {
    //     return game.game.tiles.map(tileDTO => {
    //         const owner = this.findOwner(game, tileDTO);
    //         return {
    //             identifier: {
    //                 id: tileDTO.dataTier0.tileId,
    //                 q: tileDTO.dataTier0.position.q,
    //                 r: tileDTO.dataTier0.position.r,
    //             },
    //             terrainType: tileDTO.dataTier1?.terrainType ? TerrainType.fromString(tileDTO.dataTier1.terrainType) : null,
    //             resourceType: (tileDTO.dataTier1?.resourceType === "NONE" || !tileDTO.dataTier1?.resourceType) ? null : TerrainResourceType.fromString(tileDTO.dataTier1!.resourceType),
    //             visibility: Visibility.fromString(tileDTO.dataTier0.visibility),
    //             owner: (tileDTO.dataTier1?.owner ? {
    //                 country: owner.country!!,
    //                 province: owner.province!!,
    //                 city: owner.city,
    //             } : null),
    //             influences: (tileDTO.dataTier2?.influences ? tileDTO.dataTier2?.influences.map(influenceDTO => {
    //                 return {
    //                     country: this.findCountry(game, influenceDTO.countryId),
    //                     province: this.findProvince(game, influenceDTO.provinceId),
    //                     city: this.findCity(game, influenceDTO.cityId),
    //                     amount: influenceDTO.amount,
    //                 };
    //             }) : []),
    //             objects: orDefault(tileDTO.dataTier2?.objects, [])
    //                 .map(dto => this.buildTileObjects(dto, game)),
    //         };
    //     });
    // }
    //
    // private buildTileObjects(dto: TileObjectMessage, game: GameStateMessage): TileObject {
    //     if (dto.type === "marker") {
    //         const objDTO = dto as MarkerTileObjectMessage;
    //         return {
    //             type: "marker",
    //             country: this.findCountry(game, objDTO.countryId),
    //             label: objDTO.label
    //         } as MarkerTileObject;
    //     }
    //     if (dto.type === "scout") {
    //         const objDTO = dto as ScoutTileObjectDTO;
    //         return {
    //             type: "scout",
    //             country: this.findCountry(game, objDTO.countryId),
    //             creationTurn: objDTO.creationTurn,
    //         } as ScoutTileObject;
    //     }
    //     if (dto.type === "city") {
    //         const objDTO = dto as CityTileObjectDTO;
    //         return {
    //             type: "city",
    //             country: this.findCountry(game, objDTO.countryId),
    //             city: this.findCity(game, objDTO.cityId),
    //         } as CityTileObject;
    //     }
    //     throw new Error("Unknown tile-object dto: " + dto.type);
    // }
    //
    // private buildRoutes(game: GameStateMessage): Route[] {
    //     return game.game.routes.map(routeDTO => {
    //         return {
    //             routeId: routeDTO.routeId,
    //             cityA: this.findCity(game, routeDTO.cityIdA),
    //             cityB: this.findCity(game, routeDTO.cityIdB),
    //             path: routeDTO.path,
    //         };
    //     });
    // }
    //
    // private convertDetails<T>(dtos: DetailLogEntryMessage<T>[]): DetailLogEntry<T>[] {
    //     return dtos.map(dto => ({
    //         id: dto.id,
    //         data: mapRecord(dto.data, (_, value) => value.value),
    //     }));
    // }
    //
    // private findOwner(game: GameStateMessage, tile: TileDTO) {
    //     const countryId = tile.dataTier1?.owner?.countryId;
    //     const provinceId = tile.dataTier1?.owner?.provinceId;
    //     const cityId = tile.dataTier1?.owner?.cityId;
    //     const country = countryId ? this.findCountry(game, countryId) : null;
    //     const province = provinceId ? this.findProvince(game, provinceId) : null;
    //     const city = cityId ? this.findCity(game, cityId) : null;
    //     return {
    //         country: country,
    //         province: province,
    //         city: city,
    //     };
    // }
    //
    // private findDTOCityByIdOrNull(game: GameStateMessage, cityId: string): CityDTO | null {
    //     return orNull(game.game.cities.find(c => c.dataTier1.id === cityId));
    // }
    //
    // private findCountry(game: GameStateMessage, countryId: string): CountryIdentifier {
    //     const country = game.game.countries.find(c => c.dataTier1.id === countryId);
    //     if (country) {
    //         return {
    //             id: country.dataTier1.id,
    //             name: country.dataTier1.name,
    //             color: country.dataTier1.color,
    //         };
    //     } else {
    //         throw new Error("Could not find country with id " + countryId);
    //     }
    // }
    //
    // private findProvince(game: GameStateMessage, provinceId: string): ProvinceIdentifier {
    //     const province = game.game.provinces.find(c => c.dataTier1.id === provinceId);
    //     if (province) {
    //         return {
    //             id: province.dataTier1.id,
    //             name: province.dataTier1.name,
    //             color: province.dataTier1.color,
    //         };
    //     } else {
    //         throw new Error("Could not find province with id " + provinceId);
    //     }
    // }
    //
    // private findProvinceByCity(game: GameStateMessage, cityId: string): ProvinceIdentifier {
    //     const province = game.game.provinces.find(c => c.dataTier1.cityIds.indexOf(cityId) !== -1);
    //     if (province) {
    //         return {
    //             id: province.dataTier1.id,
    //             name: province.dataTier1.name,
    //             color: province.dataTier1.color,
    //         };
    //     } else {
    //         throw new Error("Could not find province with city " + cityId);
    //     }
    // }
    //
    // private findCity(game: GameStateMessage, cityId: string): CityIdentifier {
    //     const city = game.game.cities.find(c => c.dataTier1.id === cityId);
    //     if (city) {
    //         return {
    //             id: city.dataTier1.id,
    //             name: city.dataTier1.name,
    //             color: city.dataTier1.color,
    //         };
    //     } else {
    //         throw new Error("Could not find city with id " + cityId);
    //     }
    // }


}