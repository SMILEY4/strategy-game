import {GameStateUpdate} from "./models/gameStateUpdate";
import {Tile} from "../../models/tile";
import {orNull} from "../../shared/utils";
import {GameLoopService} from "./gameLoopService";
import {GameStateAccess} from "../../state/access/GameStateAccess";

export class NextTurnService {

    private readonly gameLoopService: GameLoopService;

    constructor(gameLoopService: GameLoopService) {
        this.gameLoopService = gameLoopService;
    }


    handleNextTurn(game: GameStateUpdate) {
        console.log("handle next turn");
        GameStateAccess.setGameState({
            ...GameStateAccess.getGameState(),
            tiles: this.buildTiles(game),
        });
        this.gameLoopService.onGameStateUpdate();
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
    }

    private findMsgCity(game: GameStateUpdate, id: string) {
        return orNull(game.game.cities.find(c => c.cityId === id));
    }

}