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
import {Tile, TileView} from "../../models/tile";
import {Color} from "../../models/color";
import {CountryDatabase} from "../../state_new/countryDatabase";
import {RouteDatabase} from "../../state_new/routeDatabase";

export class DataViewService {

    private readonly userService: UserService;
    private readonly countryDb: CountryDatabase;
    private readonly routeDb: RouteDatabase;

    constructor(userService: UserService, countryDb: CountryDatabase, routeDb: RouteDatabase) {
        this.userService = userService;
        this.countryDb = countryDb;
        this.routeDb = routeDb;
    }


    public getTileView(tile: Tile, commands: Command[]): TileView {
        return {
            ...tile,
        };
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
                items: [
                    ...country.provinces.map(p => {
                        const cmd = createCityCommands.find(c => c.province?.id === p.identifier.id);
                        if (cmd) {
                            return {
                                ...p,
                                cities: [
                                    ...p.cities,
                                    {
                                        identifier: {
                                            id: cmd.id,
                                            name: cmd.name,
                                            color: Color.BLACK,
                                        },
                                        isCountryCapitol: false,
                                        isProvinceCapitol: false,
                                        isPlanned: true,
                                        createCommand: cmd,
                                    },
                                ],
                            };
                        } else {
                            return p;
                        }
                    }),
                    ...createCityCommands.filter(cmd => cmd.province === null).map(cmd => ({
                        identifier: {
                            id: cmd.id,
                            name: cmd.id,
                            color: Color.BLACK,
                        },
                        cities: [{
                            identifier: {
                                id: cmd.id,
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
                ],
            },
        };
    }


    public getProvinceView(province: Province, commands: Command[]): ProvinceView {
        const povCountryId = this.getPlayerCountry().identifier.id;
        const createCityCommands: CreateCityCommand[] = [];
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.type === CommandType.CITY_CREATE) {
                createCityCommands.push(command as CreateCityCommand);
            }
        }
        return {
            isPlayerOwned: province.country.id === povCountryId,
            identifier: province.identifier,
            country: province.country,
            cities: {
                visibility: province.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNCERTAIN,
                items: [
                    ...province.cities,
                    ...createCityCommands.filter(cmd => cmd.province?.id === province.identifier.id).map(cmd => ({
                        identifier: {
                            id: cmd.id,
                            name: cmd.name,
                            color: Color.BLACK,
                        },
                        isCountryCapitol: false,
                        isProvinceCapitol: false,
                        isPlanned: true,
                        createCommand: cmd,
                    })),
                ],
            },
            resourceLedger: {
                visibility: (province.country.id === povCountryId && province.resourceLedger !== null) ? InfoVisibility.KNOWN : InfoVisibility.UNCERTAIN,
                ledger: province.resourceLedger!,
            },
        };
    }


    public getCityView(city: City, commands: Command[]): CityView {
        const povCountryId = this.getPlayerCountry().identifier.id;
        const commandUpgradeTier = commands.find(cmd => cmd.type === CommandType.CITY_UPGRADE && (cmd as UpgradeCityCommand).city.id === city.identifier.id);
        const routes = this.routeDb.queryMany(RouteDatabase.QUERY_BY_CITY_ID, city.identifier.id)
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
                growthDetails: city.country.id === povCountryId ? city.population.growthDetails : []
            },
            buildings: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                remainingSlots: city.tier.buildingSlots - city.buildings.length,
                items: city.buildings,
            },
            productionQueue: {
                visibility: city.country.id === povCountryId ? InfoVisibility.KNOWN : InfoVisibility.UNKNOWN,
                items: this.getMergedProductionQueueEntries(city, commands),
            },
            connectedCities: routes.map(r => {
                return {
                    city: (r.cityA.id === city.identifier.id) ? r.cityB : r.cityA,
                    routeId: r.routeId,
                    routeLength: r.path.length,
                };
            }),
        };
    }


    private getMergedProductionQueueEntries(city: City, commands: Command[]): ProductionQueueEntryView[] {

        const cancelledEntries: string[] = commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
            .filter(cmd => (cmd as CancelProductionQueueCommand).city.id === city.identifier.id)
            .map(cmd => (cmd as CancelProductionQueueCommand).entry.id);

        const addCommands: AddProductionQueueCommand[] = commands
            .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD)
            .filter(cmd => (cmd as AddProductionQueueCommand).city.id === city.identifier.id)
            .map(cmd => cmd as AddProductionQueueCommand);

        return [
            ...city.productionQueue
                .filter(e => cancelledEntries.indexOf(e.id) === -1)
                .map(e => ({
                    entry: e,
                    command: null,
                })),
            ...addCommands.map(cmd => ({
                entry: this.asProductionQueueEntry(cmd),
                command: cmd,
            })),
        ];
    }

    private asProductionQueueEntry(cmd: AddProductionQueueCommand): ProductionQueueEntry {
        if (cmd.entry instanceof SettlerConstructionEntry) {
            return new SettlerProductionQueueEntry(cmd.id, 0);
        }
        if (cmd.entry instanceof BuildingConstructionEntry) {
            return new BuildingProductionQueueEntry(cmd.id, 0, (cmd.entry as BuildingConstructionEntry).buildingType);
        }
        throw new Error("Unexpected construction-entry-type");
    }

    public getConstructionEntryView(entry: ConstructionEntry, city: City, commands: Command[]): ConstructionEntryView {
        let queueCount = 0;
        let queueCountModified = 0;

        queueCount += city.productionQueue
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

    private getPlayerCountry(): Country {
        return this.countryDb.querySingleOrThrow(CountryDatabase.QUERY_BY_USER_ID, this.userService.getUserId());
    }

}