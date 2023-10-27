import {BuildingDTO, CityDTO, GameStateDTO, ProductionQueueEntryDTO, TileDTO} from "./models/gameStateDTO";
import {Tile} from "../../models/tile";
import {orDefault, orNull} from "../../shared/utils";
import {GameLoopService} from "./gameLoopService";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {TileContainer} from "../../models/tileContainer";
import {Country, CountryIdentifier} from "../../models/country";
import {Province, ProvinceIdentifier} from "../../models/province";
import {Building, City, CityIdentifier, ProductionQueueEntry} from "../../models/city";
import {SettlementTier} from "../../models/settlementTier";
import {BuildingType} from "../../models/buildingType";

export class NextTurnService {

    private readonly gameLoopService: GameLoopService;

    constructor(gameLoopService: GameLoopService) {
        this.gameLoopService = gameLoopService;
    }


    handleNextTurn(game: GameStateDTO) {
        console.log("handle next turn");
        // todo: possible performance optimisation:
        //  object pools for tiles, cities, ...
        //  move old game state to pool instead of gc -> allocate new state from pool
        GameStateAccess.setGameState({
            ...GameStateAccess.getGameState(),
            countries: this.buildCountries(game),
            provinces: this.buildProvinces(game),
            cities: this.buildCities(game),
            tiles: TileContainer.create(this.buildTiles(game), 11),
        });
        this.gameLoopService.onGameStateUpdate();
    }

    private buildCountries(game: GameStateDTO): Country[] {
        return game.game.countries.map(countryDTO => {
            return {
                identifier: {
                    id: countryDTO.dataTier1.id,
                    name: countryDTO.dataTier1.name,
                    color: countryDTO.dataTier1.color,
                },
                player: {
                    userId: countryDTO.dataTier1.userId,
                    name: countryDTO.dataTier1.userName,
                },
                settlers: orNull(countryDTO.dataTier3?.availableSettlers),
                provinces: game.game.provinces
                    .filter(provinceDTO => provinceDTO.dataTier1.countryId === countryDTO.dataTier1.id)
                    .map(msgProvince => {
                        return {
                            identifier: {
                                id: msgProvince.dataTier1.id,
                                name: msgProvince.dataTier1.name,
                                color: msgProvince.dataTier1.color,
                            },
                            cities: msgProvince.dataTier1.cityIds.map(dtoCityId => {
                                const cityDTO = this.findDTOCityByIdOrNull(game, dtoCityId)!!;
                                return {
                                    identifier: {
                                        id: cityDTO.dataTier1.id,
                                        name: cityDTO.dataTier1.name,
                                        color: cityDTO.dataTier1.color,
                                    },
                                    isCountryCapitol: false,
                                    isProvinceCapitol: cityDTO.dataTier1.isProvinceCapital,
                                };
                            }),
                        };
                    }),
            };
        });
    }

    private buildProvinces(game: GameStateDTO): Province[] {
        return game.game.provinces.map(provinceDTO => {
            return {
                identifier: {
                    id: provinceDTO.dataTier1.id,
                    name: provinceDTO.dataTier1.name,
                    color: provinceDTO.dataTier1.color,
                },
                country: this.findCountry(game, provinceDTO.dataTier1.countryId),
                cities: provinceDTO.dataTier1.cityIds.map(dtoCityId => {
                    const cityDTO = this.findDTOCityByIdOrNull(game, dtoCityId)!!;
                    return {
                        identifier: {
                            id: cityDTO.dataTier1.id,
                            name: cityDTO.dataTier1.name,
                            color: cityDTO.dataTier1.color,
                        },
                        isCountryCapitol: false,
                        isProvinceCapitol: cityDTO.dataTier1.isProvinceCapital,
                    };
                }),
            };
        });
    }

    private buildCities(game: GameStateDTO): City[] {
        return game.game.cities.map(cityDTO => {
            return {
                identifier: {
                    id: cityDTO.dataTier1.id,
                    name: cityDTO.dataTier1.name,
                    color: cityDTO.dataTier1.color,
                },
                country: this.findCountry(game, cityDTO.dataTier1.countryId),
                province: this.findProvinceByCity(game, cityDTO.dataTier1.id),
                tile: {
                    id: cityDTO.dataTier1.tile.tileId,
                    q: cityDTO.dataTier1.tile.q,
                    r: cityDTO.dataTier1.tile.r,
                },
                isCountryCapital: cityDTO.dataTier1.isCountryCapital,
                isProvinceCapital: cityDTO.dataTier1.isProvinceCapital,
                tier: SettlementTier.fromString(cityDTO.dataTier1.tier),
                population: {
                    size: orNull(cityDTO.dataTier3?.size),
                    progress: orNull(cityDTO.dataTier3?.growthProgress),
                },
                productionQueue: cityDTO.dataTier3
                    ? cityDTO.dataTier3.productionQueue.map(queueEntryDTO => this.buildProductionEntry(queueEntryDTO))
                    : [],
                buildings: cityDTO.dataTier3
                    ? cityDTO.dataTier3.buildings.map(buildingDTO => this.buildBuilding(buildingDTO))
                    : [],
            };
        });
    }

    private buildProductionEntry(entryDTO: ProductionQueueEntryDTO): ProductionQueueEntry {
        switch (entryDTO.type) {
            case "settler":
                return {
                    id: entryDTO.entryId,
                    progress: entryDTO.progress,
                    type: "settler",
                    buildingData: null,
                    settlerData: {},
                };
            case "building":
                return {
                    id: entryDTO.entryId,
                    progress: entryDTO.progress,
                    type: "building",
                    buildingData: {
                        type: BuildingType.fromString(entryDTO.buildingType!),
                    },
                    settlerData: null,
                };
        }
    }

    private buildBuilding(buildingDTO: BuildingDTO): Building {
        return {
            type: BuildingType.fromString(buildingDTO.type),
            active: buildingDTO.active,
            tile: buildingDTO.tile ? {
                id: buildingDTO.tile.tileId,
                q: buildingDTO.tile.q,
                r: buildingDTO.tile.r,
            } : null,
        }
    }

    private buildTiles(game: GameStateDTO): Tile[] {
        return game.game.tiles.map(tileDTO => {
            const owner = this.findOwner(game, tileDTO);
            return {
                identifier: {
                    id: tileDTO.dataTier0.tileId,
                    q: tileDTO.dataTier0.position.q,
                    r: tileDTO.dataTier0.position.r,
                },
                terrainType: orNull(tileDTO.dataTier1?.terrainType) as any,
                visibility: tileDTO.dataTier0.visibility as any,
                owner: (tileDTO.dataTier1?.owner ? {
                    country: owner.country!!,
                    province: owner.province!!,
                    city: owner.city,
                } : null),
                influences: (tileDTO.dataTier2?.influences ? tileDTO.dataTier2?.influences.map(influenceDTO => {
                    return {
                        country: this.findCountry(game, influenceDTO.countryId),
                        province: this.findProvince(game, influenceDTO.provinceId),
                        city: this.findCity(game, influenceDTO.cityId),
                        amount: influenceDTO.amount,
                    };
                }) : []),
                content: orDefault(tileDTO.dataTier2?.content, [])
                    .filter(contentDTO => contentDTO.type === "scout") // todo: currently only scout
                    .map(scoutDTO => ({
                        country: this.findCountry(game, scoutDTO.countryId!!),
                    })),
            };
        });
    }

    private findOwner(game: GameStateDTO, tile: TileDTO) {
        const countryId = tile.dataTier1?.owner?.countryId;
        const provinceId = tile.dataTier1?.owner?.provinceId;
        const cityId = tile.dataTier1?.owner?.cityId;
        const country = countryId ? this.findCountry(game, countryId) : null;
        const province = provinceId ? this.findProvince(game, provinceId) : null;
        const city = cityId ? this.findCity(game, cityId) : null;
        return {
            country: country,
            province: province,
            city: city,
        };
    }

    private findDTOCityByIdOrNull(game: GameStateDTO, cityId: string): CityDTO | null {
        return orNull(game.game.cities.find(c => c.dataTier1.id === cityId));
    }

    private findCountry(game: GameStateDTO, countryId: string): CountryIdentifier {
        const country = game.game.countries.find(c => c.dataTier1.id === countryId);
        if (country) {
            return {
                id: country!!.dataTier1.id,
                name: country!!.dataTier1.name,
                color: country!!.dataTier1.color,
            };
        } else {
            throw new Error("Could not find country with id " + countryId);
        }
    }

    private findProvince(game: GameStateDTO, provinceId: string): ProvinceIdentifier {
        const province = game.game.provinces.find(c => c.dataTier1.id === provinceId);
        if (province) {
            return {
                id: province!!.dataTier1.id,
                name: province!!.dataTier1.name,
                color: province!!.dataTier1.color,
            };
        } else {
            throw new Error("Could not find province with id " + provinceId);
        }
    }

    private findProvinceByCity(game: GameStateDTO, cityId: string): ProvinceIdentifier {
        const province = game.game.provinces.find(c => c.dataTier1.cityIds.indexOf(cityId) !== -1);
        if (province) {
            return {
                id: province!!.dataTier1.id,
                name: province!!.dataTier1.name,
                color: province!!.dataTier1.color,
            };
        } else {
            throw new Error("Could not find province with city " + cityId);
        }
    }

    private findCity(game: GameStateDTO, cityId: string): CityIdentifier {
        const city = game.game.cities.find(c => c.dataTier1.id === cityId);
        if (city) {
            return {
                id: city.dataTier1.id,
                name: city.dataTier1.name,
                color: city.dataTier1.color,
            };
        } else {
            throw new Error("Could not find city with id " + cityId);
        }
    }

}