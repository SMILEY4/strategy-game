import {SettlementRepository} from "../../../../../state/repository/settlementRepository";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {CountryRepository} from "../../../../../state/repository/countryRepository";
import {SettlementIdentifier} from "../../../../../models/base/Settlement";
import {WorldObjectIdentifier} from "../../../../../models/base/worldObject";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";

export namespace UseOutlinerWindow {

    export function useOpen() {
        const WINDOW_ID = "menubar-window";
        const open = useOpenWindow();
        return () => {
            open({
                id: WINDOW_ID,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <OutlinerWindow windowId={WINDOW_ID}/>,
            });
        };
    }

    export interface Data {
        settlements: SettlementIdentifier[],
        worldObjects: WorldObjectIdentifier[],
        openSettlement: (id: SettlementIdentifier) => void,
        openWorldObject: (id: WorldObjectIdentifier) => void,

    }

    export function useData(): UseOutlinerWindow.Data {

        const openSettlement = UseSettlementWindow.useOpen();
        const openWorldObject = UseWorldObjectWindow.useOpen();

        const country = CountryRepository.usePlayerCountry();
        const settlements = SettlementRepository.useByCountry(country.identifier);
        const worldObjects = WorldObjectRepository.useByCountry(country.identifier);

        return {
            settlements: settlements
                .sort((a, b) => b.population.size - a.population.size)
                .map(it => it.identifier),
            worldObjects: worldObjects
                .sort((a, b) => a.identifier.type.id.localeCompare(b.identifier.type.id))
                .map(it => it.identifier),
            openSettlement: (id: SettlementIdentifier) => openSettlement(id.id),
            openWorldObject: (id: WorldObjectIdentifier) => openWorldObject(id.id)
        };
    }

}