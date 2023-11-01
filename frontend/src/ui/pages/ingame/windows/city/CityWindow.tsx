import React, {ReactElement} from "react";
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
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import {CityIdentifier, CityView} from "../../../../../models/city";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UIAudio} from "../../../../components/audio";
import {SettlementTier} from "../../../../../models/settlementTier";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {UseCityWindow} from "./useCityWindow";
import "./cityWindow.less";
import {ProductionQueueEntryView} from "../../../../../models/productionQueueEntry";
import {Building} from "../../../../../models/building";


export interface CityWindowProps {
    windowId: string;
    cityId: string,
}

export function CityWindow(props: CityWindowProps): ReactElement {
    const data: UseCityWindow.Data = UseCityWindow.useData(props.cityId);
    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            noPadding
            style={{
                minWidth: "fit-content",
                minHeight: "300px",
            }}
        >
            <VBox fillParent>
                <CityBanner identifier={data.city.identifier} tier={data.city.tier.value}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <BaseDataSection {...data}/>
                    <UpgradeTierButton {...data}/>
                    <Spacer size="m"/>
                    <PopulationSection {...data}/>
                    <Spacer size="m"/>
                    <ContentSection {...data}/>
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

function UpgradeTierButton(props: UseCityWindow.Data) {
    return (
        <BasicTooltip
            enabled={!props.upgradeCityTier.valid}
            delay={500}
            content={
                <ul>
                    {props.upgradeCityTier.reasonsInvalid.map(reason => (<li>{reason}</li>))}
                </ul>
            }
        >
            <ButtonPrimary blue disabled={!props.upgradeCityTier.valid} onClick={() => props.upgradeCityTier.upgrade()}>
                {props.city.tier.value.nextTier === null
                    ? "Upgrade Tier"
                    : "Upgrade Tier to " + props.city.tier.value.nextTier.displayString}
            </ButtonPrimary>
        </BasicTooltip>
    );
}

function BaseDataSection(props: UseCityWindow.Data): ReactElement {
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


function PopulationSection(props: UseCityWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>Population</Header2>
            <Divider/>
            <InsetPanel>
                <KeyTextValuePair
                    name={"Size"}
                    value={props.city.population.visibility === InfoVisibility.KNOWN ? props.city.population.size : "?"}
                />
                <KeyTextValuePair
                    name={"Growth Progress"}
                    value={props.city.population.visibility === InfoVisibility.KNOWN ? props.city.population.progress : "?"}
                />
            </InsetPanel>
        </>
    );
}

function ContentSection(props: UseCityWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>
                {props.city.buildings.visibility === InfoVisibility.KNOWN
                    ? "Buildings"
                    : "Known Buildings"}
            </Header2>
            <Divider/>
            {props.city.isPlayerOwned && (
                <>
                    <ProductionQueue {...props}/>
                    <Spacer size={"xs"}/>
                </>
            )}
            <BuildingList {...props.city}/>
        </>
    );
}


function ProductionQueue(props: UseCityWindow.Data): ReactElement {
    const currentEntry = props.city.productionQueue.items.length === 0 ? null : props.city.productionQueue.items[0];
    return (
        <HBox centerVertical left gap_s>
            <ProductionQueueAddButton {...props}/>
            <ProductionQueueProgressBar data={props} currentEntry={currentEntry}/>
            <ProductionQueueCancelButton data={props} currentEntry={currentEntry}/>
        </HBox>
    );
}


function ProductionQueueAddButton(props: UseCityWindow.Data): ReactElement {
    return (
        <ButtonPrimary square onClick={props.openWindow.cityConstruction}>
            <FiPlus/>
        </ButtonPrimary>
    );
}

function ProductionQueueProgressBar(props: { data: UseCityWindow.Data, currentEntry: ProductionQueueEntryView | null }): ReactElement {
    const playOpenSound = UIAudio.usePlayAudio(AudioType.CLICK_PRIMARY.id);
    return (
        <ProgressBar
            progress={props.currentEntry === null ? 0 : props.currentEntry.entry.progress}
            className="production_queue__progress"
            onClick={() => {
                playOpenSound();
                props.data.openWindow.cityProductionQueue();
            }}
        >
            <Text relative>
                {props.currentEntry === null ? "" : props.currentEntry.entry.displayName}
            </Text>
        </ProgressBar>
    );
}

function ProductionQueueCancelButton(props: { data: UseCityWindow.Data, currentEntry: ProductionQueueEntryView | null }): ReactElement {
    return (
        <ButtonPrimary
            square round small
            onClick={() => props.data.cancelProductionQueueEntry(props.currentEntry)}
            soundId={AudioType.CLICK_CLOSE.id}
        >
            <CgClose/>
        </ButtonPrimary>
    );
}


function BuildingList(props: CityView): ReactElement {
    return (
        <>
            <HBox gap_s centerVertical left>
                <Text>{"Available Building-Slots: " + props.buildings.remainingSlots + "/" + props.tier.value.buildingSlots}</Text>
            </HBox>
            <HBox gap_s top left wrap>
                {props.buildings.items.map(building => (
                    <BuildingEntry building={building}/>
                ))}
            </HBox>
        </>
    );
}

function BuildingEntry(props: { building: Building }): ReactElement {
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
