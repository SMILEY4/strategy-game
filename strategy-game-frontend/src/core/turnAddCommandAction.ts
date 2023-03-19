import {BuildingType} from "./models/buildingType";
import {Command, CommandCreateBuilding, CommandCreateCity, CommandPlaceMarker, CommandPlaceScout} from "./models/command";
import {GameState} from "./models/gameState";
import {TilePosition} from "./models/tilePosition";
import {GameConfigRepository} from "./required/gameConfigRepository";
import {GameRepository} from "./required/gameRepository";

/**
 * Add a command - all added commands will be submitted at the end of the turn
 */
export class TurnAddCommandAction {

    private readonly gameRepository: GameRepository;
    private readonly gameConfigRepository: GameConfigRepository;

    constructor(gameRepository: GameRepository, gameConfigRepository: GameConfigRepository) {
        this.gameRepository = gameRepository;
        this.gameConfigRepository = gameConfigRepository;
    }

    perform(command: Command): void {
        console.log("add command", command);
        if (this.gameRepository.getGameState() == GameState.PLAYING) {
            this.gameRepository.addCommand(command);
        }
    }

    addPlaceMarker(tilePos: TilePosition) {
        this.perform({
            commandType: "place-marker",
            cost: {
                money: 0,
                wood: 0,
                food: 0,
                stone: 0,
                metal: 0
            },
            q: tilePos.q,
            r: tilePos.r
        } as CommandPlaceMarker);
    }

    addPlaceScout(tilePos: TilePosition) {
        this.perform({
            commandType: "place-scout",
            cost: {
                money: 0,
                wood: 0,
                food: 0,
                stone: 0,
                metal: 0
            },
            q: tilePos.q,
            r: tilePos.r
        } as CommandPlaceScout);
    }

    addCreateCity(tilePos: TilePosition, name: string, withNewProvince: boolean) {
        this.perform({
            commandType: "create-city",
            cost: {
                money: this.gameConfigRepository.getConfig().cityCostMoney,
                wood: 0,
                food: 0,
                stone: 0,
                metal: 0
            },
            q: tilePos.q,
            r: tilePos.r,
            name: name,
            withNewProvince: withNewProvince
        } as CommandCreateCity);
    }

    addCreateBuilding(cityId: string, buildingType: BuildingType) {
        this.perform({
            commandType: "create-building",
            cost: {
                money: 0,
                wood: this.gameConfigRepository.getConfig().buildingCostWood,
                food: 0,
                stone: this.gameConfigRepository.getConfig().buildingCostStone,
                metal: 0
            },
            cityId: cityId,
            buildingType: buildingType
        } as CommandCreateBuilding);
    }

}