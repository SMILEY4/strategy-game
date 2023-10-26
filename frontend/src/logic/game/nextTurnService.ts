import {CityDTO, GameStateUpdate, ProvinceDTO, TileDTO} from "./models/gameStateUpdate";
import {Tile} from "../../models/tile";
import {orDefault, orNull} from "../../shared/utils";
import {GameLoopService} from "./gameLoopService";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {TileContainer} from "../../models/tileContainer";
import {Country, CountryIdentifier} from "../../models/country";
import {Province, ProvinceIdentifier} from "../../models/province";
import {City, CityIdentifier} from "../../models/city";
import {Color} from "../../models/color";

export class NextTurnService {

    private readonly gameLoopService: GameLoopService;

    constructor(gameLoopService: GameLoopService) {
        this.gameLoopService = gameLoopService;
    }


    handleNextTurn(game: GameStateUpdate) {
        console.log("handle next turn");
        GameStateAccess.setGameState({
            ...GameStateAccess.getGameState(),
            countries: this.buildCountries(game),
            provinces: this.buildProvinces(game),
            cities: this.buildCities(game),
            tiles: TileContainer.create(this.buildTiles(game), 11),
        });
        this.gameLoopService.onGameStateUpdate();
    }

    private buildCountries(game: GameStateUpdate): Country[] {
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
                                        id: cityDTO.cityId,
                                        name: cityDTO.name,
                                    },
                                    isCountryCapitol: false,
                                    isProvinceCapitol: cityDTO.isProvinceCapital,
                                };
                            }),
                        };
                    }),
            };
        });
    }

    private buildProvinces(game: GameStateUpdate): Province[] {
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
                            id: cityDTO.cityId,
                            name: cityDTO.name,
                        },
                        isCountryCapitol: false,
                        isProvinceCapitol: cityDTO.isProvinceCapital,
                    };
                }),
            };
        });
    }

    private buildCities(game: GameStateUpdate): City[] {
        return game.game.cities.map(cityDTO => {
            const provinceDTO = this.findDTOProvinceByCity(game, cityDTO.cityId);
            return {
                identifier: {
                    id: cityDTO.cityId,
                    name: cityDTO.name,
                },
                country: this.findCountry(game, cityDTO.countryId),
                province: {
                    id: provinceDTO.dataTier1.id,
                    name: provinceDTO.dataTier1.name,
                    color: provinceDTO.dataTier1.color,
                },
                tile: {
                    id: cityDTO.tile.tileId,
                    q: cityDTO.tile.q,
                    r: cityDTO.tile.r,
                },
                isCountryCapitol: false,
                isProvinceCapitol: cityDTO.isProvinceCapital,
                population: {
                    size: cityDTO.size,
                    progress: cityDTO.growthProgress,
                },
                resources: [],
                productionQueue: cityDTO.productionQueue.map(queueEntryDTO => {
                    return {
                        id: queueEntryDTO.entryId,
                        name: queueEntryDTO.type + " - " + queueEntryDTO.buildingType,
                        progress: queueEntryDTO.progress,
                    };
                }),
                maxContentSlots: 999,
                content: cityDTO.buildings.map(buildingDTO => {
                    return {
                        icon: buildingDTO.type,
                    };
                }),
            };
        });
    }

    private buildTiles(game: GameStateUpdate): Tile[] {
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
                        province: {
                            id: influenceDTO.provinceId,
                            name: influenceDTO.provinceId,
                            color: Color.BLACK,
                        },
                        city: {
                            id: influenceDTO.cityId,
                            name: this.findDTOCityByIdOrNull(game, influenceDTO.cityId)?.name!,
                        },
                        amount: influenceDTO.amount,
                    };
                }) : []),
                content: orDefault(tileDTO.dataTier2?.content, [])
                    .filter(contentDTO => contentDTO.type === "scout")
                    .map(scoutDTO => ({
                        country: this.findCountry(game, scoutDTO.countryId!!),
                    })),
            };
        });
    }

    private findOwner(game: GameStateUpdate, tile: TileDTO) {
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

    private findDTOProvinceByCity(game: GameStateUpdate, cityId: string): ProvinceDTO {
        return game.game.provinces.find(p => p.dataTier1.cityIds.indexOf(cityId) !== -1)!!;
    }

    private findDTOCityByIdOrNull(game: GameStateUpdate, cityId: string): CityDTO | null {
        return orNull(game.game.cities.find(c => c.cityId === cityId));
    }

    private findCountry(game: GameStateUpdate, countryId: string): CountryIdentifier {
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

    private findProvince(game: GameStateUpdate, provinceId: string): ProvinceIdentifier {
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

    private findCity(game: GameStateUpdate, cityId: string): CityIdentifier {
        const city = game.game.cities.find(c => c.cityId === cityId);
        if (city) {
            return {
                id: city!!.cityId,
                name: city!!.name,
            };
        } else {
            throw new Error("Could not find city with id " + cityId);
        }
    }

}