import {BuildingType} from "../models/buildingType";
import {City} from "../models/city";
import {CommandProductionQueueAddEntry} from "../models/command";
import {validations} from "../../shared/validation";
import {useCommands} from "./useCommands";
import {useCountryPlayer} from "./useCountryPlayer";
import {useGameConfig} from "./useGameConfig";

export function useValidateCreateBuilding(city: City | null): (type: BuildingType) => boolean {
    const country = useCountryPlayer();
    const commands = useCommands();
    const config = useGameConfig();

    if (city) {
        return (type: BuildingType) => {
            return validations(ctx => {
                ctx.validate("BUILDING.TILE_OWNER", () => {
                    return city.countryId === country.countryId;
                });
                ctx.validate("BUILDING.CITY_SPACE", () => {
                    const amountBuildingCommands = commands
                        .filter(cmd => cmd.commandType === "production-queue-add-entry")
                        .map(cmd => cmd as CommandProductionQueueAddEntry)
                        .filter(cmd => cmd.cityId === city.cityId)
                        .length;
                    if (city.isProvinceCapital) {
                        return config.cityBuildingSlots - (city.buildings.length + amountBuildingCommands) > 0;
                    } else {
                        return config.townBuildingSlots - (city.buildings.length + amountBuildingCommands) > 0;
                    }
                });
            }).isValid();
        };
    } else {
        return () => false;
    }
}
