import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithBanner} from "../../../../components/windows/decorated/DecoratedWindow";
import {Header4} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {FiPlus} from "react-icons/fi";
import {CgClose} from "react-icons/cg";
import {joinClassNames} from "../../../../components/utils";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {BuildingInfoTooltip} from "../common/BuildingInfoTooltip";
import {CityView, PopulationGrowthDetailType} from "../../../../../models/city";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UIAudio} from "../../../../components/audio";
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
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {ETTooltip} from "../../../../components/textenriched/elements/ETTooltip";
import {Else, If, Then, When} from "react-if";
import {WindowSection} from "../../../../components/section/ContentSection";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";


export interface CityWindowProps {
    windowId: string;
    cityId: string,
}

export function CityWindow(props: CityWindowProps): ReactElement {
    const data: UseCityWindow.Data = UseCityWindow.useData(props.cityId);
    return (
        <DefaultDecoratedWindowWithBanner
            windowId={props.windowId}
            title={data.city.base.identifier.name}
            subtitle={data.city.base.tier.displayString}
        >
            <BaseDataSection {...data}/>
            <UpgradeTierButton {...data}/>
            <Spacer size="m"/>
            <PopulationSection {...data}/>
            <Spacer size="m"/>
            <RouteSectionSection {...data}/>
            <Spacer size="m"/>
            <ContentSection {...data}/>
        </DefaultDecoratedWindowWithBanner>
    );
}

function UpgradeTierButton(props: UseCityWindow.Data) {
    return (
        <When condition={props.city.base.isPlayerOwned}>
            <Tooltip>
                <Tooltip.Trigger>
                    <ButtonPrimary blue disabled={!props.upgradeCityTier.valid}
                                   onClick={() => props.upgradeCityTier.upgrade()}>
                        {props.city.base.tier.nextTier === null
                            ? "Upgrade Tier"
                            : "Upgrade Tier to " + props.city.base.tier.nextTier.displayString}
                    </ButtonPrimary>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    {props.upgradeCityTier.reasonsInvalid.map((reason, index) => (
                        <EnrichedText key={index}>{reason}</EnrichedText>
                    ))}
                </Tooltip.Content>
            </Tooltip>
        </When>
    );
}

function BaseDataSection(props: UseCityWindow.Data): ReactElement {
    return (
        <WindowSection>
            <InsetKeyValueGrid>

                <EnrichedText>Id:</EnrichedText>
                <EnrichedText>{props.city.base.identifier.id}</EnrichedText>

                <EnrichedText>Tier:</EnrichedText>
                <ChangeInfoText prevValue={props.city.base.tier.displayString}
                                nextValue={props.city.modified.tier?.displayString}/>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText><ETLink
                    onClick={props.openWindow.country}>{props.city.base.country.name}</ETLink></EnrichedText>

                <EnrichedText>Province:</EnrichedText>
                <EnrichedText><ETLink
                    onClick={props.openWindow.province}>{props.city.base.province.name}</ETLink></EnrichedText>

                <EnrichedText>Tile:</EnrichedText>
                <EnrichedText><ETLink
                    onClick={props.openWindow.tile}>{props.city.base.tile.q + ", " + props.city.base.tile.r}</ETLink></EnrichedText>

            </InsetKeyValueGrid>
        </WindowSection>
    );
}


function PopulationSection(props: UseCityWindow.Data): ReactElement {
    return (
        <WindowSection title="Population">
            <InsetKeyValueGrid>

                <If condition={props.city.base.population.size.visible}>
                    <Then>
                        <EnrichedText>Size</EnrichedText>
                        <EnrichedText>{props.city.base.population.size.value}</EnrichedText>
                    </Then>
                    <Else>
                        <EnrichedText>Size</EnrichedText>
                        <EnrichedText>?</EnrichedText>
                    </Else>
                </If>

                <If condition={props.city.base.population.growth.visible}>
                    <Then>
                        <EnrichedText>Growth Progress</EnrichedText>
                        <ETTooltip>
                            <Tooltip.Trigger>
                                <EnrichedText><ETNumber typeNone>{props.city.base.population.growth.value.progress * 100}</ETNumber>%</EnrichedText>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <Header4>Population Growth</Header4>
                                <SimpleDivider/>
                                {props.city.base.population.growth.value.details.map(detail => buildGrowthDetail(detail))}
                            </Tooltip.Content>
                        </ETTooltip>
                    </Then>
                    <Else>
                        <EnrichedText>Growth Progress</EnrichedText>
                        <EnrichedText>?</EnrichedText>
                    </Else>
                </If>

            </InsetKeyValueGrid>
        </WindowSection>

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
                        not enough food available: <ETNumber>{entry.data["amount"]}</ETNumber>
                    </EnrichedText>
                );
            case "STARVING":
                return (
                    <EnrichedText>
                        no food available: <ETNumber>{entry.data["amount"]}</ETNumber>
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
        <WindowSection title="Connected Cities">
            <InsetPanel>
                {props.city.base.connectedCities.map(entry => (
                    <HBox left centerVertical gap_s key={entry.route}>
                        <BsArrowRight/>
                        <LinkButton align="left" onClick={() => props.openWindow.connectedCity(entry)}>
                            {entry.city.name}
                        </LinkButton>
                        <Spacer size={"xs"}/>
                        <Text>
                            {"(" + entry.distance + ")"}
                        </Text>
                    </HBox>
                ))}
            </InsetPanel>
        </WindowSection>
    );
}

function ContentSection(props: UseCityWindow.Data): ReactElement {
    return (
        <WindowSection
            title={"Buildings"}>
            <When condition={props.city.base.isPlayerOwned}>
                <ProductionQueue {...props}/>
                <Spacer size={"xs"}/>
            </When>
            <BuildingList {...props.city}/>
        </WindowSection>
    );
}


function ProductionQueue(props: UseCityWindow.Data): ReactElement {
    const currentEntry = props.city.modified.productionQueue.length === 0 ? null : props.city.modified.productionQueue[0];
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

function ProductionQueueProgressBar(props: {
    data: UseCityWindow.Data,
    currentEntry: ProductionQueueEntryView | null
}): ReactElement {
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

function ProductionQueueCancelButton(props: {
    data: UseCityWindow.Data,
    currentEntry: ProductionQueueEntryView | null
}): ReactElement {
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
                <Text>{"Building-Slots: " + props.base.buildings.value.length + "/" + props.base.tier.buildingSlots}</Text>
            </HBox>
            <HBox gap_s top left wrap>
                {props.base.buildings.value.map((building, index) => (
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
