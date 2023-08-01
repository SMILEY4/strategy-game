import {City} from "../models/city";
import {validations} from "../../shared/validation";
import {useCommands} from "./useCommands";
import {CommandUpgradeSettlementTier} from "../models/command";
import {useProvinceByCity} from "./useProvinceByCity";
import {useCitiesByProvince} from "./useCitiesByProvince";

export function useValidateUpgradeSettlementTier(city: City | null): () => boolean {
    const commands = useCommands();
    const province = useProvinceByCity(city?.cityId);
    const cities = useCitiesByProvince(province?.provinceId);

    if (city) {
        return () => {
            return validations(ctx => {
                ctx.validate("SETTLEMENT_TIER_UPGRADE.ALREADY_UPGRADE", () => {
                    return commands
                        .filter(c => c.commandType === "upgrade-settlement-tier")
                        .map(c => c as CommandUpgradeSettlementTier)
                        .filter(c => c.cityId === city.cityId)
                        .length === 0;
                });
                ctx.validate("SETTLEMENT_TIER_UPGRADE.TARGET_TIER", () => {
                    return city.tier !== "CITY";
                });
                ctx.validate("SETTLEMENT_TIER_UPGRADE.MIN_POP_SIZE", () => {
                    return city.size >= getRequiredSize(city.tier);
                });
                ctx.validate("SETTLEMENT_TIER_UPGRADE.ONE_CITY_PER_PROVINCE", () => {
                    if (city.tier === "TOWN") {
                        return cities
                            .filter(c => c.tier === "CITY")
                            .length === 0;
                    } else {
                        return true;
                    }
                });
            }).isValid();
        };
    } else {
        return () => false;
    }

    function getRequiredSize(currentTier: "VILLAGE" | "TOWN" | "CITY"): number {
        if (currentTier === "VILLAGE") {
            return 2;
        }
        if (currentTier === "TOWN") {
            return 6;
        }
        if (currentTier === "CITY") {
            return 9990;
        }
        throw Error("Unexpected settlement tier: " + currentTier);
    }

}

