import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {useOpenProvinceWindow} from "../province/ProvinceWindow";
import {useOpenCountryWindow} from "../country/CountryWindow";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {FiPlus} from "react-icons/fi";
import {CgClose} from "react-icons/cg";
import {formatPercentage, joinClassNames} from "../../../../components/utils";
import {useCancelProductionQueueEntry, useUpgradeSettlementTier, useValidateUpgradeSettlementTier} from "../../../../hooks/city";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {useOpenCityProductionWindow} from "../cityProduction/CityProductionWindow";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import {Building, City, CityIdentifier, ProductionQueueEntry} from "../../../../../models/city";
import {useOpenTileWindow} from "../tile/TileWindow";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import "./cityMenu.less";
import {CityRepository} from "../../../../../state/access/CityRepository";
import {useOpenCityProductionQueueWindow} from "../cityProductionQueue/CityProductionQueue";
import {CancelProductionQueueCommand} from "../../../../../models/command";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {CommandType} from "../../../../../models/commandType";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UIAudio} from "../../../../components/audio";

export function useOpenCityWindow() {
    const addWindow = useOpenWindow();
    return (cityId: string, keepPosition: boolean) => {
        const WINDOW_ID = "menubar-window";
        addWindow({
            id: WINDOW_ID,
            className: "city-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <CityWindow windowId={WINDOW_ID} cityId={cityId}/>,
        }, keepPosition);
    };
}


export interface CityWindowProps {
    windowId: string;
    cityId: string,
}


export function CityWindow(props: CityWindowProps): ReactElement {

    const city = CityRepository.useCityById(props.cityId);
    const openCountryWindow = useOpenCountryWindow();
    const openProvinceWindow = useOpenProvinceWindow();
    const openTileWindow = useOpenTileWindow();

    const [validUpgradeSettlement, reasonsValidationsUpgrade] = useValidateUpgradeSettlementTier(city);
    const [, , upgradeSettlementTier] = useUpgradeSettlementTier(city);

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            style={{
                minWidth: "fit-content",
                minHeight: "300px",
            }}
            noPadding
        >
            <VBox fillParent>
                <CityBanner identifier={city.identifier}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <CityBaseDataSection
                        data={city}
                        openCountry={() => openCountryWindow(city.country.id, true)}
                        openProvince={() => openProvinceWindow(city.province.id, true)}
                        openTile={() => openTileWindow(city.tile)}
                    />

                    <BasicTooltip
                        enabled={!validUpgradeSettlement}
                        delay={500}
                        content={
                            <ul>
                                {reasonsValidationsUpgrade.map(e => (<li>{e}</li>))}
                            </ul>
                        }
                    >
                        <ButtonPrimary blue disabled={!validUpgradeSettlement} onClick={() => upgradeSettlementTier()}>
                            {city.tier.nextTier === null
                                ? "Upgrade Tier"
                                : "Upgrade Tier to " + city.tier.nextTier.displayString}
                        </ButtonPrimary>
                    </BasicTooltip>

                    <CityPopulationSection data={city}/>

                    <CityContentSection data={city}/>

                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}


function CityBanner(props: { identifier: CityIdentifier }): ReactElement {
    return (
        <Banner spaceAbove>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function CityBaseDataSection(props: {
    data: City,
    openCountry: () => void,
    openProvince: () => void,
    openTile: () => void,
}): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"Id"}
                value={props.data.identifier.id}
            />
            <KeyTextValuePair
                name={"Tier"}
                value={props.data.tier.displayString}
            />
            <KeyLinkValuePair
                name={"Country"}
                value={props.data.country.name}
                onClick={props.openCountry}
            />
            <KeyLinkValuePair
                name={"Province"}
                value={props.data.province.name}
                onClick={props.openProvince}
            />
            <KeyLinkValuePair
                name={"Tile"}
                value={props.data.tile.q + ", " + props.data.tile.r}
                onClick={props.openTile}
            />
        </InsetPanel>
    );
}


function CityPopulationSection(props: { data: City }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Population</Header2>
            <Divider/>
            <InsetPanel>
                <KeyTextValuePair
                    name={"Size"}
                    value={props.data.population.size === null ? "?" : props.data.population.size}
                />
                <KeyTextValuePair
                    name={"Growth Progress"}
                    value={props.data.population.progress === null ? "?" : formatPercentage(props.data.population.progress, true)}
                />
            </InsetPanel>
        </>
    );
}


function CityContentSection(props: { data: City }): ReactElement {
    return (
        <>
            <Spacer size="m"/>
            <Header2 centered>Contents</Header2>
            <Divider/>

            <CityProductionQueue data={props.data}/>

            <Spacer size={"xs"}/>

            <CityContentList data={props.data}/>
        </>
    );
}


function CityProductionQueue(props: { data: City }): ReactElement {
    // todo: button to open window with list of complete production queue
    // todo: display cancelled queue entries (as strikethrough / grayed out / ...)
    const entry = props.data.productionQueue.length === 0 ? null : props.data.productionQueue[0];
    const entryData = {
        id: entry === null ? "-" : entry.id,
        name: entry === null ? "-" : getProductionQueueEntryName(entry),
        progress: entry === null ? 0 : entry.progress,
    };
    const cancelCommands = CommandRepository.useCommands()
        .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
        .map(cmd => cmd as CancelProductionQueueCommand);
    const cancelled = entry ? isCancelled(entry, cancelCommands) : false
    const cancelEntry = useCancelProductionQueueEntry(props.data.identifier, entry);
    const openProductionWindow = useOpenCityProductionWindow();
    const openQueueWindow = useOpenCityProductionQueueWindow();
    const playSound = UIAudio.usePlayAudio(AudioType.CLICK_A.id)
    return (
        <HBox centerVertical left gap_s>
            <ButtonPrimary square onClick={() => openProductionWindow(props.data.identifier)}>
                <FiPlus/>
            </ButtonPrimary>

            <ProgressBar
                progress={entryData.progress}
                className="production_queue__progress"
                onClick={() => {
                    playSound();
                    openQueueWindow(props.data.identifier)
                }}
            >
                <Text relative strikethrough={cancelled}>{entryData.name}</Text>
            </ProgressBar>

            <ButtonPrimary
                square round small
                disabled={props.data.productionQueue.length === 0 || cancelled}
                onClick={cancelEntry}
                soundId={AudioType.CLICK_B.id}
            >
                <CgClose/>
            </ButtonPrimary>
        </HBox>
    );
}

function getProductionQueueEntryName(entry: ProductionQueueEntry): string {
    switch (entry.type) {
        case "settler":
            return "Settler";
        case "building":
            return entry.buildingData!.type.displayString;
    }
}

function CityContentList(props: { data: City }): ReactElement {
    return (
        <>
            <HBox gap_s centerVertical left>
                <Text>{"Slots: " + props.data.buildings.length + "/" + props.data.tier.buildingSlots}</Text>
            </HBox>
            <HBox gap_s top left wrap>
                {props.data.buildings.map(building => (
                    <ContentBox building={building}/>
                ))}
            </HBox>
        </>
    );
}

function ContentBox(props: { building: Building }) {
    return (
        <BuildingInfoTooltip building={props.building}>
            <div
                className={joinClassNames(["city-content-box", props.building.active ? null : "city-content-box--disabled"])}
                style={{
                    backgroundImage: "url('" + props.building.type.icon + "')",
                }}
            />
        </BuildingInfoTooltip>
    );
}

function isCancelled(entry: ProductionQueueEntry, commands: CancelProductionQueueCommand[]): boolean {
    return commands.some(cmd => cmd.entry.id === entry.id);
}
