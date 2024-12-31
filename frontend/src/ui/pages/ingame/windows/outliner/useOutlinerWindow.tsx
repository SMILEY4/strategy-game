import {SettlementRepository} from "../../../../../state/repository/settlementRepository";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {CountryRepository} from "../../../../../state/repository/countryRepository";
import {Settlement, SettlementIdentifier} from "../../../../../models/base/Settlement";
import {WorldObject, WorldObjectIdentifier} from "../../../../../models/base/worldObject";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {useDI} from "../../../../../appContext";
import {CameraService} from "../../../../../logic/game/cameraService";
import {Country} from "../../../../../models/base/country";

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
        settlements: {
            entries: Settlement[],
            open: (entry: Settlement) => void,
            focusCamera: (entry: Settlement) => void,
        },
        worldObjects: {
            entries: WorldObject[],
            open: (entry: WorldObject) => void,
            focusCamera: (entry: WorldObject) => void,
        },
        countries: {
            entries: Country[],
            open: (entry: Country) => void,
            focusCamera: (entry: Country) => void,
        }
    }

    export function useData(): UseOutlinerWindow.Data {

        const cameraService = useDI<CameraService>(CameraService.name);

        const openSettlement = UseSettlementWindow.useOpen();
        const openWorldObject = UseWorldObjectWindow.useOpen();

        const country = CountryRepository.usePlayerCountry();
        const settlements = SettlementRepository.useByCountry(country.identifier);
        const worldObjects = WorldObjectRepository.useByCountry(country.identifier);
        const countries = CountryRepository.useAll();

        return {
            settlements: {
                entries: settlements
                    .sort((a, b) => b.population.size - a.population.size),
                open: (entry: Settlement) => openSettlement(entry.identifier.id),
                focusCamera: (entry: Settlement) => cameraService.centerCameraOnTile(entry.tile),
            },
            worldObjects: {
                entries: worldObjects
                    .sort((a, b) => a.identifier.type.id.localeCompare(b.identifier.type.id)),
                open: (entry: WorldObject) => openWorldObject(entry.identifier.id),
                focusCamera: (entry: WorldObject) => cameraService.centerCameraOnTile(entry.tile),
            },
            countries: {
                entries: countries
                    .sort((a, _) => a.identifier.isUserCountry ? +1 : -1),
                open: () => undefined, // todo
                focusCamera: () => undefined, // todo
            }
        };
    }

}