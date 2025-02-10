import {SettlementRepository} from "../../../../../state/repository/settlementRepository";
import {WorldObjectRepository} from "../../../../../state/repository/worldObjectRepository";
import {CountryRepository} from "../../../../../state/repository/countryRepository";
import {Settlement} from "../../../../../models/base/Settlement";
import {WorldObject} from "../../../../../models/base/worldObject";
import {useOpenWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {UseSettlementWindow} from "../settlement/useSettlementWindow";
import {UseWorldObjectWindow} from "../worldobject/useWorldObjectWindow";
import {useDI} from "../../../../../appContext";
import {CameraService} from "../../../../../logic/game/cameraService";
import {Country} from "../../../../../models/base/country";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {CommandRepository} from "../../../../../state/repository/commandRepository";
import {CommandType, CreateSettlement} from "../../../../../models/base/command";
import {AudioService, AudioType} from "../../../../../common/audioService";
import {UIAudio} from "../../../../components/window/audio";

export namespace UseOutlinerWindow {

    export function useOpen() {
        const open = useOpenWindow();
        return () => {
            const windowId = UID.generate();
            open({
                id: windowId,
                groupId: WindowGroup.LEFT_SIDEBAR,
                anchor: WindowStore.ANCHOR_LEFT_SIDE,
                content: <OutlinerWindow windowId={windowId}/>,
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
        },
        commandsCreateSettlement: CreateSettlement[]
    }

    export function useData(): UseOutlinerWindow.Data {

        const cameraService = useDI<CameraService>(CameraService.name);
        const playClickSound = UIAudio.usePlayAudio(AudioType.CLICK_PRIMARY.id);

        const openSettlement = UseSettlementWindow.useOpen();
        const openWorldObject = UseWorldObjectWindow.useOpen();

        const country = CountryRepository.usePlayerCountry();
        const settlements = SettlementRepository.useByCountry(country.identifier);
        const worldObjects = WorldObjectRepository.useByCountry(country.identifier);
        const countries = CountryRepository.useAll();
        const commandsCreateSettlement = CommandRepository.useAllByType<CreateSettlement>(CommandType.CREATE_SETTLEMENT)


        return {
            settlements: {
                entries: settlements
                    .sort((a, b) => b.population.size - a.population.size),
                open: (entry: Settlement) => {
                    openSettlement(entry.identifier.id);
                    playClickSound();
                },
                focusCamera: (entry: Settlement) => {
                    cameraService.centerCameraOnTile(entry.tile);
                    playClickSound();
                },
            },
            worldObjects: {
                entries: worldObjects
                    .sort((a, b) => a.identifier.type.id.localeCompare(b.identifier.type.id)),
                open: (entry: WorldObject) => {
                    openWorldObject(entry.identifier.id);
                    playClickSound();
                },
                focusCamera: (entry: WorldObject) => {
                    cameraService.centerCameraOnTile(entry.tile);
                    playClickSound();
                },
            },
            countries: {
                entries: countries
                    .sort((a, _) => a.identifier.isUserCountry ? +1 : -1),
                open: () => undefined, // todo
                focusCamera: () => undefined, // todo
            },
            commandsCreateSettlement: commandsCreateSettlement
        };
    }

}