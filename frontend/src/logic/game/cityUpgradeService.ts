import {CommandService} from "./commandService";
import {UserService} from "../user/userService";
import {City} from "../../models/city";
import {SettlementTier} from "../../models/settlementTier";
import {Country} from "../../models/country";
import {CommandType} from "../../models/commandType";
import {UpgradeCityCommand} from "../../models/command";
import {CommandDatabase} from "../../state/commandDatabase";
import {CityDatabase} from "../../state/cityDatabase";
import {CountryDatabase} from "../../state/countryDatabase";
import {ProvinceDatabase} from "../../state/provinceDatabase";
import {getHiddenOrDefault} from "../../models/hiddenType";

export class CityUpgradeService {

    private readonly commandService: CommandService;
    private readonly userService: UserService;
    private readonly countryDb: CountryDatabase;
    private readonly provinceDb: ProvinceDatabase;
    private readonly cityDb: CityDatabase;
    private readonly commandDb: CommandDatabase;

    constructor(commandService: CommandService,
                userService: UserService,
                countryDb: CountryDatabase,
                provinceDb: ProvinceDatabase,
                cityDb: CityDatabase,
                commandDb: CommandDatabase,
    ) {
        this.commandService = commandService;
        this.userService = userService;
        this.countryDb = countryDb;
        this.provinceDb = provinceDb;
        this.cityDb = cityDb;
        this.commandDb = commandDb;
    }


    public validate(city: City): string[] {
        const country = this.getPlayerCountry();
        const failureReasons: string[] = [];

        if (city.country.id !== country.identifier.id) {
            failureReasons.push("Not owner of city");
        }
        if (this.isAlreadyUpgrading(city)) {
            failureReasons.push("Already upgrading");
        }
        if (city.tier.nextTier === null) {
            failureReasons.push("City is already at max tier");
        }
        if (city.population.size.visible) {
            const minRequiredSize = city.tier.nextTier === null ? 0 : city.tier.nextTier.minRequiredSize;
            if (getHiddenOrDefault(city.population.size, 0) < minRequiredSize) {
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

    private isAlreadyUpgrading(city: City): boolean {
        return this.commandDb.queryMany(CommandDatabase.QUERY_BY_TYPE, CommandType.CITY_UPGRADE)
            .some(cmd => (cmd as UpgradeCityCommand).city.id === city.identifier.id);
    }

    public upgrade(city: City) {
        this.commandService.upgradeSettlementTier(
            city.identifier,
            city.tier,
            city.tier.nextTier!,
        );
    }

    private getPlayerCountry(): Country {
        return this.countryDb.querySingleOrThrow(CountryDatabase.QUERY_BY_USER_ID, this.userService.getUserId());
    }

    private getProvinceCityCount(city: City): number {
        const province = this.provinceDb.querySingleOrThrow(ProvinceDatabase.QUERY_BY_CITY_ID, city.identifier.id);
        let count = 0;
        for (const cityReduced of province.cities) {
            const city = this.cityDb.querySingleOrThrow(CityDatabase.QUERY_BY_ID, cityReduced.identifier.id);
            if (city.tier === SettlementTier.CITY) {
                count++;
            }
        }
        return count;
    }

}
