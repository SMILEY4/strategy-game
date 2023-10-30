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
import {KeyLinkValuePair, KeyTextValuePair, KeyValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {FiPlus} from "react-icons/fi";
import {CgClose} from "react-icons/cg";
import {joinClassNames} from "../../../../components/utils";
import {useCancelProductionQueueEntry} from "../../../../hooks/city";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {useOpenCityProductionWindow} from "../cityProduction/CityProductionWindow";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import {Building, CityIdentifier, CityView, ProductionQueueEntry} from "../../../../../models/city";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import "./cityMenu.less";
import {useOpenCityProductionQueueWindow} from "../cityProductionQueue/CityProductionQueue";
import {CancelProductionQueueCommand} from "../../../../../models/command";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {CommandType} from "../../../../../models/commandType";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UIAudio} from "../../../../components/audio";
import {SettlementTier} from "../../../../../models/settlementTier";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {useCityWindow, UseCityWindow} from "./useCityWindow";

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

    const data: UseCityWindow.Data = useCityWindow(props.cityId);

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
                <CityBanner identifier={data.city.identifier} tier={data.city.tier.value}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                    <CityBaseDataSection {...data}/>

                    {/*todo: own component: "UpgradeTierButton"*/}
                    <BasicTooltip
                        enabled={!data.upgradeCityTier.valid}
                        delay={500}
                        content={
                            <ul>
                                {data.upgradeCityTier.reasonsInvalid.map(reason => (<li>{reason}</li>))}
                            </ul>
                        }
                    >
                        <ButtonPrimary blue disabled={!data.upgradeCityTier.valid} onClick={() => data.upgradeCityTier.upgrade()}>
                            {data.city.tier.value.nextTier === null
                                ? "Upgrade Tier"
                                : "Upgrade Tier to " + data.city.tier.value.nextTier.displayString}
                        </ButtonPrimary>
                    </BasicTooltip>

                    <Spacer size="m"/>

                    <CityPopulationSection data={data.city}/>

                    <Spacer size="m"/>

                    <CityContentSection data={data.city}/>

                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}


function CityBanner(props: { identifier: CityIdentifier, tier: SettlementTier }): ReactElement {
    return (
        <Banner spaceAbove subtitle={props.tier.displayString}>
            <Header1 centered>{props.identifier.name}</Header1>
        </Banner>
    );
}

function CityBaseDataSection(props: UseCityWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"Id"}
                value={props.city.identifier.id}
            />
            <KeyValuePair name={"Tier"}>
                <ChangeInfoText prevValue={props.city.tier.value.displayString} nextValue={props.city.tier.modifiedValue?.displayString}/>
            </KeyValuePair>
            <KeyLinkValuePair
                name={"Country"}
                value={props.city.country.name}
                onClick={props.openWindow.country}
            />
            <KeyLinkValuePair
                name={"Province"}
                value={props.city.province.name}
                onClick={props.openWindow.province}
            />
            <KeyLinkValuePair
                name={"Tile"}
                value={props.city.tile.q + ", " + props.city.tile.r}
                onClick={props.openWindow.tile}
            />
        </InsetPanel>
    );
}


function CityPopulationSection(props: { data: CityView }): ReactElement {
    return (
        <>
            <Header2 centered>Population</Header2>
            <Divider/>
            <InsetPanel>
                <KeyTextValuePair
                    name={"Size"}
                    value={props.data.population.visibility === InfoVisibility.KNOWN ? props.data.population.size : "?"}
                />
                <KeyTextValuePair
                    name={"Growth Progress"}
                    value={props.data.population.visibility === InfoVisibility.KNOWN ? props.data.population.progress : "?"}
                />
            </InsetPanel>
        </>
    );
}

function CityContentSection(props: { data: CityView }): ReactElement {
    return (
        <>

            <Header2 centered>
                {props.data.buildings.visibility === InfoVisibility.KNOWN
                    ? "Buildings"
                    : "Known Buildings"}
            </Header2>

            <Divider/>

            {props.data.isPlayerOwned && (<CityProductionQueue data={props.data}/>)}

            <Spacer size={"xs"}/>

            <CityContentList data={props.data}/>
        </>
    );
}


function CityProductionQueue(props: { data: CityView }): ReactElement {
    // todo: improve
    const entry = props.data.productionQueue.items.length === 0 ? null : props.data.productionQueue.items[0];
    const entryData = {
        id: entry === null ? "-" : entry.id,
        name: entry === null ? "-" : getProductionQueueEntryName(entry),
        progress: entry === null ? 0 : entry.progress,
    };
    const cancelCommands = CommandRepository.useCommands()
        .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
        .map(cmd => cmd as CancelProductionQueueCommand);
    const cancelled = entry ? isCancelled(entry, cancelCommands) : false;
    const cancelEntry = useCancelProductionQueueEntry(props.data.identifier, entry);
    const openProductionWindow = useOpenCityProductionWindow();
    const openQueueWindow = useOpenCityProductionQueueWindow();
    const playSound = UIAudio.usePlayAudio(AudioType.CLICK_A.id);
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
                    openQueueWindow(props.data.identifier);
                }}
            >
                <Text relative strikethrough={cancelled}>{entryData.name}</Text>
            </ProgressBar>

            <ButtonPrimary
                square round small
                disabled={props.data.productionQueue.items.length === 0 || cancelled}
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


function CityContentList(props: { data: CityView }): ReactElement {
    return (
        <>
            <HBox gap_s centerVertical left>
                <Text>
                    {
                        "Building-Slots: "
                        + (props.data.buildings.visibility === InfoVisibility.KNOWN ? props.data.buildings.items.length : "?")
                        + "/"
                        + props.data.tier.value.buildingSlots
                    }
                </Text>
            </HBox>
            <HBox gap_s top left wrap>
                {props.data.buildings.items.map(building => (
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
