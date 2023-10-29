import {CommandService} from "./commandService";
import {UserService} from "../user/userService";
import {City} from "../../models/city";
import {SettlementTier} from "../../models/settlementTier";
import {Country} from "../../models/country";
import {CountryRepository} from "../../state/access/CountryRepository";
import {ProvinceRepository} from "../../state/access/ProvinceRepository";
import {CityRepository} from "../../state/access/CityRepository";

export class CityUpgradeService {

    private readonly commandService: CommandService;
    private readonly userService: UserService;
    private readonly countryRepository: CountryRepository;
    private readonly provinceRepository: ProvinceRepository;
    private readonly cityRepository: CityRepository;

    constructor(commandService: CommandService,
                userService: UserService,
                countryRepository: CountryRepository,
                provinceRepository: ProvinceRepository,
                cityRepository: CityRepository) {
        this.commandService = commandService;
        this.userService = userService;
        this.countryRepository = countryRepository;
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
    }


    public validate(city: City): string[] {
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

    public upgrade(city: City) {
        this.commandService.upgradeSettlementTier(
            city.identifier,
            city.tier,
            city.tier.nextTier!,
        );
    }

    private getPlayerCountry(): Country {
        return this.countryRepository.getCountryByUserId(this.userService.getUserId());
    }

    private getProvinceCityCount(city: City): number {
        const province = this.provinceRepository.getProvinceByCity(city.identifier.id);
        let count = 0;
        for (let i = 0; i < province.cities.length; i++) {
            const cityReduced = province.cities[i];
            const city = this.cityRepository.getCity(cityReduced.identifier.id);
            if (city.tier === SettlementTier.CITY) {
                count++;
            }
        }
        return count;
    }

}
