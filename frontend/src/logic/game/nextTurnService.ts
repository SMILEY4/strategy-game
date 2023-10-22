import {GameStateUpdate} from "./models/gameStateUpdate";
import {Tile} from "../../models/tile";
import {orDefault, orNull} from "../../shared/utils";
import {GameLoopService} from "./gameLoopService";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {TileContainer} from "../../models/tileContainer";
import {Country, CountryIdentifier} from "../../models/country";
import {Province} from "../../models/province";
import {City} from "../../models/city";

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
        return game.game.countries.map(msgCountry => {
            return {
                identifier: {
                    id: msgCountry.dataTier1.countryId,
                    name: msgCountry.dataTier1.countryId,
                },
                userId: msgCountry.dataTier1.userId,
                playerName: msgCountry.dataTier1.userId,
                settlers: orDefault(msgCountry.dataTier2?.availableSettlers, 0),
                provinces: game.game.provinces
                    .filter(msgProvince => msgProvince.countryId === msgCountry.dataTier1.countryId)
                    .map(msgProvince => {
                        return {
                            identifier: {
                                id: msgProvince.provinceId,
                                name: msgProvince.provinceId,
                            },
                            cities: msgProvince.cityIds.map(msgCityId => {
                                const msgCity = this.findMsgCityById(game, msgCityId)!!;
                                return {
                                    identifier: {
                                        id: msgCity.cityId,
                                        name: msgCity.name,
                                    },
                                    isCountryCapitol: false,
                                    isProvinceCapitol: msgCity.isProvinceCapital,
                                };
                            }),
                        };
                    }),
            };
        });
    }

    private buildProvinces(game: GameStateUpdate): Province[] {
        return game.game.provinces.map(msgProvince => {
            return {
                identifier: {
                    id: msgProvince.provinceId,
                    name: msgProvince.provinceId,
                },
                country: {
                    id: msgProvince.countryId,
                    name: msgProvince.countryId,
                },
                cities: msgProvince.cityIds.map(msgCityId => {
                    const msgCity = this.findMsgCityById(game, msgCityId)!!;
                    return {
                        identifier: {
                            id: msgCity.cityId,
                            name: msgCity.name,
                        },
                        isCountryCapitol: false,
                        isProvinceCapitol: msgCity.isProvinceCapital,
                    };
                }),
            };
        });
    }

    private buildCities(game: GameStateUpdate): City[] {
        return game.game.cities.map(msgCity => {
            const msgProvince = this.findMsgProvinceByCity(game, msgCity.cityId);
            return {
                identifier: {
                    id: msgCity.cityId,
                    name: msgCity.name,
                },
                country: {
                    id: msgCity.countryId,
                    name: msgCity.countryId,
                },
                province: {
                    id: msgProvince.provinceId,
                    name: msgProvince.provinceId,
                },
                tile: {
                    id: msgCity.tile.tileId,
                    q: msgCity.tile.q,
                    r: msgCity.tile.r,
                },
                isCountryCapitol: false,
                isProvinceCapitol: msgCity.isProvinceCapital,
                population: {
                    size: msgCity.size,
                    progress: msgCity.growthProgress,
                },
                resources: [],
                productionQueue: msgCity.productionQueue.map(msgQueueEntry => {
                    return {
                        id: msgQueueEntry.entryId,
                        name: msgQueueEntry.type + " - " + msgQueueEntry.buildingType,
                        progress: msgQueueEntry.progress,
                    };
                }),
                maxContentSlots: 999,
                content: msgCity.buildings.map(msgBuilding => {
                    return {
                        icon: msgBuilding.type,
                    };
                }),
            };
        });
    }

    private buildTiles(game: GameStateUpdate): Tile[] {
        return game.game.tiles.map(msgTile => {
            return {
                identifier: {
                    id: msgTile.dataTier0.tileId,
                    q: msgTile.dataTier0.position.q,
                    r: msgTile.dataTier0.position.r,
                },
                terrainType: orNull(msgTile.dataTier1?.terrainType) as any,
                visibility: msgTile.dataTier0.visibility as any,
                owner: (msgTile.dataTier1?.owner ? {
                    country: {
                        id: msgTile.dataTier1.owner.countryId,
                        name: msgTile.dataTier1.owner.countryId,
                    },
                    province: {
                        id: msgTile.dataTier1.owner.provinceId,
                        name: msgTile.dataTier1.owner.provinceId,
                    },
                    city: (msgTile.dataTier1.owner.cityId ? {
                        id: msgTile.dataTier1.owner.cityId,
                        name: this.findMsgCityById(game, msgTile.dataTier1.owner.cityId)?.name!,
                    } : null),
                } : null),
                influences: (msgTile.dataTier2?.influences ? msgTile.dataTier2?.influences.map(msgInfluence => {
                    return {
                        country: {
                            id: msgInfluence.countryId,
                            name: msgInfluence.countryId,
                        },
                        province: {
                            id: msgInfluence.provinceId,
                            name: msgInfluence.provinceId,
                        },
                        city: {
                            id: msgInfluence.cityId,
                            name: this.findMsgCityById(game, msgInfluence.cityId)?.name!,
                        },
                        amount: msgInfluence.amount,
                    };
                }) : []),
                content: orDefault(msgTile.dataTier2?.content, [])
                    .filter(msgContent => msgContent.type === "scout")
                    .map(msgScout => ({
                        country: this.findCountry(game, msgScout.countryId!!),
                    })),
            };
        });
    }

    private findMsgProvinceByCity(game: GameStateUpdate, cityId: string) {
        return game.game.provinces.find(p => p.cityIds.indexOf(cityId) !== -1)!!;
    }

    private findMsgCityById(game: GameStateUpdate, cityId: string) {
        return orNull(game.game.cities.find(c => c.cityId === cityId));
    }

    private findCountry(game: GameStateUpdate, countryId: string): CountryIdentifier {
        const country = game.game.countries.find(c => c.dataTier1.countryId === countryId);
        if (countryId) {
            return {
                id: country?.dataTier1.countryId!!,
                name: country?.dataTier1.countryId!!,
            };
        } else {
            throw new Error("Could not find country with id " + countryId);
        }
    }

}