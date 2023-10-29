import {Country, CountryView} from "../../models/country";
import {Command, CreateCityCommand, UpgradeCityCommand} from "../../models/command";
import {CommandType} from "../../models/commandType";
import {InfoVisibility} from "../../models/infoVisibility";
import {UserService} from "../user/userService";
import {CountryRepository} from "../../state/access/CountryRepository";
import {CommandRepository} from "../../state/access/CommandRepository";
import {Province, ProvinceView} from "../../models/province";
import {City, CityView} from "../../models/city";

export class DataViewService {

    private readonly userService: UserService;
    private readonly commandRepository: CommandRepository;
    private readonly countryRepository: CountryRepository;

    constructor(userService: UserService, countryRepository: CountryRepository, commandRepository: CommandRepository) {
        this.userService = userService;
        this.countryRepository = countryRepository;
        this.commandRepository = commandRepository;
    }


    public getCountryView(country: Country): CountryView {
        const commands = this.getCommands();
        const povCountryId = this.getPlayerCountry().identifier.id;
        const createCityCommands: CreateCityCommand[] = [];
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.CITY_CREATE) {
                createCityCommands.push(command as CreateCityCommand);
            }
        }
        return {
            isPlayerOwned: country.identifier.id === povCountryId,
            identifier: country.identifier,
            player: country.player,
            settlers: {
                visibility: country.identifier.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                value: country.identifier.id === povCountryId ? country.settlers! : 0,
                modifiedValue: (country.identifier.id === povCountryId || createCityCommands.length === 0) ? null : (country.settlers! - createCityCommands.length),
            },
            provinces: {
                visibility: country.identifier.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNCERTAIN,
                items: country.provinces,
            },
        };
    }


    public getProvinceView(province: Province): ProvinceView {
        const povCountryId = this.getPlayerCountry().identifier.id;
        return {
            isPlayerOwned: province.country.id === povCountryId,
            identifier: province.identifier,
            country: province.country,
            cities: {
                visibility: province.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNCERTAIN,
                items: province.cities,
            },
            resourceBalance: {
                visibility: province.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNCERTAIN,
                items: province.resourceBalance,
            },
        };
    }


    public getCityView(city: City): CityView {
        const povCountryId = this.getPlayerCountry().identifier.id;
        const cmdUpgradeTier = this.getCommands().find(cmd => cmd.type === CommandType.CITY_UPGRADE && (cmd as UpgradeCityCommand).city.id === city.identifier.id);
        return {
            isPlayerOwned: city.country.id === povCountryId,
            identifier: city.identifier,
            country: city.country,
            province: city.province,
            tile: city.tile,
            isCountryCapital: city.isCountryCapital,
            isProvinceCapital: city.isProvinceCapital,
            tier: {
                value: city.tier,
                modifiedValue: cmdUpgradeTier ? (cmdUpgradeTier as UpgradeCityCommand).targetTier : null
            },
            population: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                size: city.country.id === povCountryId ? city.population.size! : 0,
                progress: city.country.id === povCountryId ? city.population.progress! : 0,
            },
            buildings: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                items: city.buildings,
            },
            productionQueue: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                items: city.productionQueue,
            },
        };
    }


    private getCommands(): Command[] {
        return this.commandRepository.getCommands();
    }

    private getPlayerCountry(): Country {
        return this.countryRepository.getCountryByUserId(this.userService.getUserId());
    }

}