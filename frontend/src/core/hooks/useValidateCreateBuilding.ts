import {BuildingType} from "../models/buildingType";
import {City} from "../models/city";
import {validations} from "../../shared/validation";
import {useCommands} from "./useCommands";
import {useCountryPlayer} from "./useCountryPlayer";
import {CommandProductionQueueAddBuildingEntry} from "../models/command";

export function useValidateCreateBuilding(city: City | null): (type: BuildingType) => boolean {
    const country = useCountryPlayer();
    const commands = useCommands();

    if (city) {
        return (type: BuildingType) => {
            return validations(ctx => {
                ctx.validate("BUILDING.TILE_OWNER", () => {
                    return city.countryId === country.countryId;
                });
                ctx.validate("BUILDING.CITY_SPACE", () => {
                    const amountBuildingCommands = commands
                        .filter(cmd => cmd.commandType === "production-queue-add-entry.building")
                        .map(cmd => cmd as CommandProductionQueueAddBuildingEntry)
                        .filter(cmd => cmd.cityId === city.cityId)
                        .length;
                    return getMaxBuildingSlots(city.tier) - (city.buildings.length + amountBuildingCommands) > 0;
                });
            }).isValid();
        };
    } else {
        return () => false;
    }

    function getMaxBuildingSlots(tier: "VILLAGE" | "TOWN" | "CITY"): number {
        if (tier === "VILLAGE") {
            return 2;
        }
        if (tier === "TOWN") {
            return 4;
        }
        if (tier === "CITY") {
            return 6;
        }
        throw Error("Unexpected settlement tier: " + tier);
    }

}

