import {Country, CountryView} from "../../models/country";
import {
    AddProductionQueueCommand,
    CancelProductionQueueCommand,
    Command,
    CreateCityCommand,
    UpgradeCityCommand,
} from "../../models/command";
import {CommandType} from "../../models/commandType";
import {UserService} from "../user/userService";
import {Province, ProvinceView} from "../../models/province";
import {City, CityView} from "../../models/city";
import {
    BuildingConstructionEntry,
    ConstructionEntry,
    ConstructionEntryView,
    SettlerConstructionEntry,
} from "../../models/constructionEntry";
import {
    BuildingProductionQueueEntry,
    ProductionQueueEntry,
    ProductionQueueEntryView,
    SettlerProductionQueueEntry,
} from "../../models/productionQueueEntry";
import {Color} from "../../models/color";
import {getHiddenOrDefault} from "../../models/hiddenType";

export class DataViewService {

    public getCountryView(country: Country, commands: Command[]): CountryView {

        const createCityCommands: CreateCityCommand[] = [];
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.CITY_CREATE) {
                createCityCommands.push(command as CreateCityCommand);
            }
        }

        return {
            base: country,
            modified: {
                settlers: country.settlers.visible ? (country.settlers.value - createCityCommands.length) : null,
                createdProvinces: createCityCommands.filter(c => c.province === null).map(cmd => ({
                    identifier: {
                        id: "...",
                        name: cmd.name,
                        color: Color.BLACK,
                    },
                    cities: [{
                        identifier: {
                            id: "...",
                            name: cmd.name,
                            color: Color.BLACK,
                        },
                        isCountryCapitol: false,
                        isProvinceCapitol: true,
                        isPlanned: true,
                        createCommand: cmd,
                    }],
                    isPlanned: true,
                })),
                createdCities: createCityCommands.filter(c => c.province !== null).map(cmd => ({
                    identifier: {
                        id: "...",
                        name: cmd.name,
                        color: Color.BLACK,
                    },
                    isCountryCapitol: false,
                    isProvinceCapitol: true,
                    isPlanned: true,
                    createCommand: cmd,
                })),
            },
        };
    }


    public getProvinceView(province: Province, commands: Command[]): ProvinceView {

        const createCityCommands: CreateCityCommand[] = [];
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.CITY_CREATE && (command as CreateCityCommand).province?.id === province.identifier.id) {
                createCityCommands.push(command as CreateCityCommand);
            }
        }
        return {
            base: province,
            modified: {
                createdCities: createCityCommands.map(cmd => ({
                    identifier: {
                        id: "...",
                        name: cmd.name,
                        color: Color.BLACK,
                    },
                    isCountryCapitol: false,
                    isProvinceCapitol: true,
                    isPlanned: true,
                    createCommand: cmd,
                })),
            },
        };
    }


    public getCityView(city: City, commands: Command[]): CityView {
        const commandUpgradeTier = commands.find(cmd => cmd.type === CommandType.CITY_UPGRADE && (cmd as UpgradeCityCommand).city.id === city.identifier.id);
        const commandsProductionQueueAdd = commands.filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD && (cmd as AddProductionQueueCommand).city.id === city.identifier.id).map(cmd => cmd as AddProductionQueueCommand);
        const commandsProductionQueueCancel = commands.filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL && (cmd as CancelProductionQueueCommand).city.id === city.identifier.id).map(cmd => cmd as CancelProductionQueueCommand);

        const viewQueueEntries: ProductionQueueEntryView[] = getHiddenOrDefault(city.productionQueue, [])
            .filter(e => commandsProductionQueueCancel.findIndex(c => c.entry.id === e.id) === -1)
            .map(e => ({
                entry: e,
                command: null,
            }));
        viewQueueEntries.push(...commandsProductionQueueAdd.map(c => ({
            entry: this.asProductionQueueEntry(c),
            command: c,
        })));

        return {
            base: city,
            modified: {
                tier: commandUpgradeTier ? (commandUpgradeTier as UpgradeCityCommand).targetTier : null,
                productionQueue: viewQueueEntries,
            },
        };
    }

    private asProductionQueueEntry(cmd: AddProductionQueueCommand): ProductionQueueEntry {
        if (cmd.entry instanceof SettlerConstructionEntry) {
            return new SettlerProductionQueueEntry(cmd.id, 0);
        }
        if (cmd.entry instanceof BuildingConstructionEntry) {
            return new BuildingProductionQueueEntry(cmd.id, 0, cmd.entry.buildingType);
        }
        throw new Error("Unexpected construction-entry-type");
    }


    public getConstructionEntryView(entry: ConstructionEntry, city: City, commands: Command[]): ConstructionEntryView {
        let queueCount = 0;
        let queueCountModified = 0;

        queueCount += getHiddenOrDefault(city.productionQueue, [])
            .filter(e => {
                if (e instanceof SettlerProductionQueueEntry) {
                    return entry instanceof SettlerConstructionEntry;
                }
                if (e instanceof BuildingProductionQueueEntry) {
                    return entry instanceof BuildingConstructionEntry
                        && entry.buildingType === (e as BuildingProductionQueueEntry).buildingType;
                }
                return false;
            })
            .length;

        queueCountModified += commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD)
            .map(cmd => cmd as AddProductionQueueCommand)
            .filter(cmd => cmd.entry.id === entry.id)
            .length;

        queueCountModified -= commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
            .map(cmd => (cmd as CancelProductionQueueCommand).entry)
            .filter(e => {
                if (e instanceof SettlerProductionQueueEntry) {
                    return entry instanceof SettlerConstructionEntry;
                }
                if (e instanceof BuildingProductionQueueEntry) {
                    return entry instanceof BuildingConstructionEntry
                        && entry.buildingType === (e as BuildingProductionQueueEntry).buildingType;
                }
                return false;
            })
            .length;

        return {
            entry: entry,
            disabled: false,
            queueCount: {
                value: queueCount,
                modifiedValue: queueCount + queueCountModified,
            },
        };
    }

}