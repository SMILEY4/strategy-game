import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1, Header2, Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {Divider} from "../../../../components/divider/Divider";
import {Banner} from "../../../../components/banner/Banner";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {FiPlus} from "react-icons/fi";
import {CgClose} from "react-icons/cg";
import {joinClassNames} from "../../../../components/utils";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import {CityIdentifier, CityView, PopulationGrowthDetailType} from "../../../../../models/city";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UIAudio} from "../../../../components/audio";
import {SettlementTier} from "../../../../../models/settlementTier";
import {InfoVisibility} from "../../../../../models/infoVisibility";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {UseCityWindow} from "./useCityWindow";
import {ProductionQueueEntryView} from "../../../../../models/productionQueueEntry";
import {Building} from "../../../../../models/building";
import {BsArrowRight} from "react-icons/bs";
import {LinkButton} from "../../../../components/button/link/LinkButton";
import "./cityWindow.less";
import {DetailLogEntry} from "../../../../../models/detailLogEntry";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {ETText} from "../../../../components/textenriched/elements/ETText";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {If} from "../../../../components/if/If";
import {ETTooltip} from "../../../../components/textenriched/elements/ETTooltip";


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
                    <RouteSectionSection {...data}/>
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
                    {props.upgradeCityTier.reasonsInvalid.map((reason, index) => (
                        <li key={index}>{reason}</li>
                    ))}
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
            <KeyValueGrid>

                <EnrichedText>Id:</EnrichedText>
                <EnrichedText>{props.city.identifier.id}</EnrichedText>

                <EnrichedText>Tier:</EnrichedText>
                <ChangeInfoText prevValue={props.city.tier.value.displayString} nextValue={props.city.tier.modifiedValue?.displayString}/>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.country}>{props.city.country.name}</ETLink></EnrichedText>

                <EnrichedText>Province:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.province}>{props.city.province.name}</ETLink></EnrichedText>

                <EnrichedText>Tile:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.tile}>{props.city.tile.q + ", " + props.city.tile.r}</ETLink></EnrichedText>

            </KeyValueGrid>
        </InsetPanel>
    );
}


function PopulationSection(props: UseCityWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>Population</Header2>
            <Divider/>
            <InsetPanel>
                <KeyValueGrid>

                    <If condition={props.city.population.visibility === InfoVisibility.KNOWN}>

                        <EnrichedText>Size</EnrichedText>
                        <EnrichedText>{props.city.population.size}</EnrichedText>

                        <EnrichedText>Growth Progress</EnrichedText>
                        <EnrichedText>
                            <ETTooltip content={
                                <>
                                    <Header4>Population Growth</Header4>
                                    {props.city.population.growthDetails.map(detail => buildGrowthDetail(detail))}
                                </>
                            }>
                                {props.city.population.progress}
                            </ETTooltip>
                        </EnrichedText>

                    </If>

                    <If condition={props.city.population.visibility !== InfoVisibility.KNOWN}>

                        <EnrichedText>Size</EnrichedText>
                        <EnrichedText>?</EnrichedText>

                        <EnrichedText>Growth Progress</EnrichedText>
                        <EnrichedText>?</EnrichedText>

                    </If>

                </KeyValueGrid>
            </InsetPanel>
        </>
    );

    function buildGrowthDetail(entry: DetailLogEntry<PopulationGrowthDetailType>): React.ReactElement {
        switch (entry.id) {
            case "MORE_FOOD_AVAILABLE":
                return (
                    <EnrichedText>
                        food availability: <ETNumber>{entry.data["amount"]}</ETNumber>
                    </EnrichedText>
                );
            case "NOT_ENOUGH_FOOD":
                return (
                    <EnrichedText>
                        not enough food available: <ETNumber>{-entry.data["amount"]}</ETNumber>
                    </EnrichedText>
                );
            case "STARVING":
                return (
                    <EnrichedText>
                        no food available: <ETNumber>{-entry.data["amount"]}</ETNumber>
                    </EnrichedText>
                );
            case "PROVINCE_CAPITAL":
                return (
                    <EnrichedText>
                        province capital: <ETNumber>{entry.data["amount"]}</ETNumber>
                    </EnrichedText>
                );
            case "MAX_SIZE_REACHED":
                return (
                    <EnrichedText>
                        <ETText>Population reached maximum size</ETText>
                    </EnrichedText>
                );
        }
    }
}

function RouteSectionSection(props: UseCityWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>Connected Cities</Header2>
            <Divider/>
            <InsetPanel>
                {props.city.connectedCities.map(entry => {
                    return (
                        <HBox left centerVertical gap_s key={entry.routeId}>
                            <BsArrowRight/>
                            <LinkButton align="left" onClick={() => props.openWindow.connectedCity(entry)}>
                                {entry.city.name}
                            </LinkButton>
                            <Spacer size={"xs"}/>
                            <Text>
                                {"(" + entry.routeLength + ")"}
                            </Text>
                        </HBox>
                    );
                })}
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
                {props.buildings.items.map((building, index) => (
                    <BuildingEntry key={index} building={building}/>
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


function formatValue(value: number, includePlus?: boolean): string {
    const simpleValue = Math.round(value * 100) / 100;
    if (simpleValue < 0) {
        return "-" + Math.abs(simpleValue);
    }
    if (simpleValue > 0) {
        if (includePlus === false) {
            return "" + Math.abs(simpleValue);
        } else {
            return "+" + Math.abs(simpleValue);
        }
    }
    return "0";
}