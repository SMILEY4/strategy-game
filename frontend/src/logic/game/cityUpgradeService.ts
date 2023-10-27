import {CommandService} from "./commandService";
import {UserService} from "../user/userService";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {City} from "../../models/city";
import {SettlementTier} from "../../models/settlementTier";
import {Country} from "../../models/country";

export class CityUpgradeService {

    readonly commandService: CommandService;
    readonly userService: UserService;

    constructor(commandService: CommandService, userService: UserService) {
        this.commandService = commandService;
        this.userService = userService;
    }


    validate(city: City): string[] {
        const country = this.getPlayerCountry();
        const failureReasons: string[] = [];

        if (city.country.id !== country.identifier.id) {
            failureReasons.push("Not owner of city");
        }
        if (city.tier.nextTier === null) {
            failureReasons.push("City is already at max tier");
        }
        if (city.population.size !== null) {
            const minRequiredSize = city.tier.nextTier === null ? 0 : city.tier.nextTier.minRequiredSize;
            if (city.population.size < minRequiredSize) {
                failureReasons.push("City is not large enough (required " + minRequiredSize + ")");
            }
        }
        if (city.tier.nextTier === SettlementTier.CITY) {
            if (this.getProvinceCityCount(city) > 0) {
                failureReasons.push("Province already has a settlement at city-tier");
            }
        }

        return failureReasons;
    }

    upgrade(city: City) {
        this.commandService.upgradeSettlementTier(
            city.identifier,
            city.tier,
            city.tier.nextTier!,
        );
    }

    private getPlayerCountry(): Country {
        return GameStateAccess.getCountryByUserId(this.userService.getUserId())!!;
    }

    private getProvinceCityCount(city: City): number {
        const province = GameStateAccess.getProvinceByCity(city.identifier.id);
        let count = 0;
        for (let i = 0; i < province.cities.length; i++) {
            const cityReduced = province.cities[i];
            const city = GameStateAccess.getCity(cityReduced.identifier.id);
            if (city.tier === SettlementTier.CITY) {
                count++;
            }
        }
        return count;
    }

}
