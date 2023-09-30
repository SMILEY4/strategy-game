import {GameStateUpdate} from "./models/gameStateUpdate";
import {GameRepository} from "./gameRepository";
import {Tile} from "../../models/tile";
import {orNull} from "../../shared/utils";
import {GameLoopService} from "./gameLoopService";

export class NextTurnService {

    private readonly gameRepository: GameRepository;
    private readonly gameLoopService: GameLoopService;

    constructor(gameRepository: GameRepository, gameLoopService: GameLoopService) {
        this.gameRepository = gameRepository;
        this.gameLoopService = gameLoopService;
    }


    handleNextTurn(game: GameStateUpdate) {
        console.log("handle next turn");
        // todo:
        // 1. create and populate tile-store
        // 2. render tiles
        this.setTiles(game);
        // 3. handle more stuff (cities, provinces, ...) + render
        this.gameLoopService.onGameStateUpdate();
    }

    private setTiles(game: GameStateUpdate) {
        const tiles: Tile[] = game.game.tiles.map(msgTile => {
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
                        name: this.findMsgCity(game, msgTile.dataTier1.owner.cityId)?.name!,
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
                            name: this.findMsgCity(game, msgInfluence.cityId)?.name!,
                        },
                        amount: msgInfluence.amount,
                    };
                }) : []),
            };
        });
        this.gameRepository.setTiles(tiles);
    }

    private findMsgCountry(game: GameStateUpdate, id: string) {
        return orNull(game.game.countries.find(c => c.dataTier1.countryId === id));
    }

    private findMsgProvince(game: GameStateUpdate, id: string) {
        return orNull(game.game.provinces.find(p => p.provinceId === id));
    }

    private findMsgCity(game: GameStateUpdate, id: string) {
        return orNull(game.game.cities.find(c => c.cityId === id));
    }

    // private setCities(game: GameStateUpdate) {
    //     const cities = game.game.cities.map(msgCity => {
    //         const msgCountry = game.game.countries.find(c => c.dataTier1.countryId === msgCity.countryId)!!;
    //         const msgProvince = game.game.provinces.find(p => p.cityIds.indexOf(msgCity.cityId) !== -1)!!;
    //         const city: City = {
    //             identifier: {
    //                 id: msgCity.cityId,
    //                 name: msgCity.name,
    //             },
    //             country: {
    //                 id: msgCountry.dataTier1.countryId,
    //                 name: msgCountry.dataTier1.countryId,
    //             },
    //             province: {
    //                 id: msgProvince.provinceId,
    //                 name: msgProvince.provinceId,
    //             },
    //             tile: {
    //                 id: msgCity.tile.tileId,
    //                 q: msgCity.tile.q,
    //                 r: msgCity.tile.r,
    //             },
    //             isCountryCapitol: false,
    //             isProvinceCapitol: msgCity.isProvinceCapital,
    //             population: {
    //                 size: msgCity.size,
    //                 progress: msgCity.growthProgress,
    //             },
    //             resources: [],
    //             productionQueue: msgCity.productionQueue.map(msgProdQueueEntry => {
    //                 if (msgProdQueueEntry.type === "building") {
    //                     return {
    //                         id: msgProdQueueEntry.entryId,
    //                         name: "Settler",
    //                         progress: msgProdQueueEntry.progress,
    //                     };
    //                 } else {
    //                     return {
    //                         id: msgProdQueueEntry.entryId,
    //                         name: msgProdQueueEntry.buildingType!!,
    //                         progress: msgProdQueueEntry.progress,
    //                     };
    //                 }
    //             }),
    //             maxContentSlots: 3,
    //             content: [],
    //         };
    //     });
    // }

}