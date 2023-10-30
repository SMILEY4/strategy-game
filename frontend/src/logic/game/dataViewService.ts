import {Country, CountryView} from "../../models/country";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    Command,
    CreateCityCommand,
    UpgradeCityCommand,
} from "../../models/command";
import {CommandType} from "../../models/commandType";
import {InfoVisibility} from "../../models/infoVisibility";
import {UserService} from "../user/userService";
import {CountryRepository} from "../../state/access/CountryRepository";
import {CommandRepository} from "../../state/access/CommandRepository";
import {Province, ProvinceView} from "../../models/province";
import {City, CityView, ProductionQueueEntry} from "../../models/city";
import {
    BuildingConstructionEntry,
    ConstructionEntry,
    ConstructionEntryView,
    SettlerConstructionEntry,
} from "../../models/ConstructionEntry";

export class DataViewService {

    private readonly userService: UserService;
    private readonly commandRepository: CommandRepository;
    private readonly countryRepository: CountryRepository;

    constructor(userService: UserService, countryRepository: CountryRepository, commandRepository: CommandRepository) {
        this.userService = userService;
        this.countryRepository = countryRepository;
        this.commandRepository = commandRepository;
    }


    public getCountryView(country: Country, commands: Command[]): CountryView {
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
                modifiedValue: (country.identifier.id === povCountryId && createCityCommands.length > 0) ? (country.settlers! - createCityCommands.length) : null,
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


    public getCityView(city: City, commands: Command[]): CityView {
        const povCountryId = this.getPlayerCountry().identifier.id;
        const commandUpgradeTier = commands.find(cmd => cmd.type === CommandType.CITY_UPGRADE && (cmd as UpgradeCityCommand).city.id === city.identifier.id);
        const commandsCancelQueueEntry = commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
            .map(cmd => cmd as CancelProductionQueueCommand);
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
                modifiedValue: commandUpgradeTier ? (commandUpgradeTier as UpgradeCityCommand).targetTier : null,
            },
            population: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                size: city.country.id === povCountryId ? city.population.size! : 0,
                progress: city.country.id === povCountryId ? city.population.progress! : 0,
            },
            buildings: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                remainingSlots: city.tier.buildingSlots - city.buildings.length,
                items: city.buildings,
            },
            productionQueue: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                items: city.productionQueue.map(entry => ({
                    entry: entry,
                    cancelled: commandsCancelQueueEntry.some(cmd => cmd.id === entry.id),
                    name: this.getProductionQueueEntryName(entry),
                })),
            },
        };
    }

    public getConstructionEntryView(entry: ConstructionEntry, city: City, commands: Command[]): ConstructionEntryView {
        let queueCount = 0;
        queueCount += commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD)
            .map(cmd => cmd as AddProductionQueueCommand)
            .filter(cmd => cmd.entry.id === entry.id)
            .length;
        queueCount += city.productionQueue
            .filter(e => {
                if (e.type === "settler") {
                    return entry instanceof SettlerConstructionEntry;
                }
                if (e.type === "building") {
                    return entry instanceof BuildingConstructionEntry && entry.buildingType === e.buildingData?.type;
                }
                return false;
            })
            .length;
        return {
            entry: entry,
            disabled: false,
            queueCount: queueCount,
        };
    }


    private getProductionQueueEntryName(entry: ProductionQueueEntry): string {
        switch (entry.type) {
            case "settler":
                return "Settler";
            case "building":
                return entry.buildingData!.type.displayString;
        }
    }

    private getPlayerCountry(): Country {
        return this.countryRepository.getCountryByUserId(this.userService.getUserId());
    }

}