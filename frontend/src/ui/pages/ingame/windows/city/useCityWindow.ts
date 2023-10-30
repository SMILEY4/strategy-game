import {CityRepository} from "../../../../../state/access/CityRepository";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {useOpenTileWindow} from "../tile/TileWindow";
import {useUpgradeSettlementTier, useValidateUpgradeSettlementTier} from "../../../../hooks/city";
import {CityView} from "../../../../../models/city";

export namespace UseCityWindow {
    export interface Data {
        city: CityView,
        openWindow: {
            country: () => void,
            province: () => void,
            tile: () => void,
        },
        upgradeCityTier: {
            valid: boolean,
            reasonsInvalid: string[],
            upgrade: () => void
        }
    }
}

export function useCityWindow(cityId: string): UseCityWindow.Data {

    const city = CityRepository.useCityById(cityId);
    const cityView = AppCtx.DataViewService().getCityView(city);
    const commands = CommandRepository.useCommands(); // required to react to changes to commands

    const openCountryWindow = useOpenCountryWindow();
    const openProvinceWindow = useOpenProvinceWindow();
    const openTileWindow = useOpenTileWindow();
    const [validUpgradeSettlement, reasonsValidationsUpgrade] = useValidateUpgradeSettlementTier(city);
    const [, , upgradeSettlementTier] = useUpgradeSettlementTier(city);


    return {
        city: cityView,
        openWindow: {
            country: () => openCountryWindow(city.country.id, ),
            province: openProvinceWindow,
            tile: openTileWindow,
        },
        upgradeCityTier: {
            valid: validUpgradeSettlement,
            reasonsInvalid: reasonsValidationsUpgrade,
            upgrade: upgradeSettlementTier,
        },
    };
}