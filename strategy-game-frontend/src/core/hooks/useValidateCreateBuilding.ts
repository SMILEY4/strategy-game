import {BuildingType} from "../../models/state/buildingType";
import {City} from "../../models/state/city";
import {CommandCreateBuilding} from "../../models/state/command";
import {validations} from "../../shared/validation";
import {useCommands} from "./useCommands";
import {useCountryPlayer} from "./useCountryPlayer";
import {useCountryResources} from "./useCountryResources";
import {useGameConfig} from "./useGameConfig";

export function useValidateCreateBuilding(city: City | null): (type: BuildingType) => boolean {
    const resources = useCountryResources();
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
                        .filter(cmd => cmd.commandType === "create-building")
                        .map(cmd => cmd as CommandCreateBuilding)
                        .filter(cmd => cmd.cityId === city.cityId)
                        .length;
                    if (city.isCity) {
                        return config.cityBuildingSlots - (city.buildings.length + amountBuildingCommands) > 0;
                    } else {
                        return config.townBuildingSlots - (city.buildings.length + amountBuildingCommands) > 0;
                    }
                });
                ctx.validate("BUILDING.RESOURCES", () => {
                    return resources.wood >= config.buildingCostWood && resources.stone >= config.buildingCostStone;
                });
            }).isValid();
        };
    } else {
        return () => false;
    }
}