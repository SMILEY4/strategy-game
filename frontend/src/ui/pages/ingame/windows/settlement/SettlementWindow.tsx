import React, {ReactElement, useState} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {UseSettlementWindow} from "./useSettlementWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import "./settlementWindow.less";
import {Header2} from "../../../../components/header/Header";
import {Else, If, Then} from "react-if";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {HeaderBanner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {DecoratedPanel, DecoratedPanelColorBackground} from "../../../../components/panels/decorated/DecoratedPanel";
import {Color} from "../../../../../models/base/color";
import {ETText} from "../../../../components/textenriched/elements/ETText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {ETSpacer} from "../../../../components/textenriched/elements/ETSpacer";
import {ResourceLedgerBox} from "./ResourceLedgerBox";
import {BuildingBox} from "./BuildingBox";
import {FiPlus} from "react-icons/fi";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {CgClose} from "react-icons/cg";
import {CSS_COLOR_SUCCESS_LIGHT, CSS_COLOR_WARN_LIGHT} from "../../../../components/commonColors";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {ProgressCircle} from "./ProgressCircle";

export interface SettlementWindowProps {
    windowId: string;
    identifier: string | null;
}

// todo: handle non-owner view with limited information -> currently results in errors
export function SettlementWindow(props: SettlementWindowProps): ReactElement {

    const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

    const [selectedPanel, setSelectedPanel] = useState("Overview");

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox center>
                    <Text>No settlement selected</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>

                <HeaderBanner
                    title={data.settlement.identifier.name}
                    subtitle={"Settlement"}
                    color={data.settlement.country.color}
                />

                <VBox gap_s top stretch padding_m>

                    <HBox centerHorizontal gap_xs centerVertical fillParentWidth>
                        <ButtonPrimary
                            round small
                            active={selectedPanel === "Overview"}
                            onClick={() => setSelectedPanel("Overview")}
                        >
                            Overview
                        </ButtonPrimary>
                        <ButtonPrimary
                            round small
                            active={selectedPanel === "Industry"}
                            onClick={() => setSelectedPanel("Industry")}
                        >
                            Industry
                        </ButtonPrimary>
                        <ButtonPrimary
                            round small
                            active={selectedPanel === "Population"}
                            onClick={() => setSelectedPanel("Population")}
                        >
                            Population
                        </ButtonPrimary>
                        <ButtonPrimary
                            circle small
                            active={selectedPanel === "Debug"}
                            onClick={() => setSelectedPanel("Debug")}
                        >
                            D
                        </ButtonPrimary>
                    </HBox>

                    <Divider type="simple"/>

                    <If condition={selectedPanel === "Overview"}>
                        <Then>
                            <VBox scrollable gap_s stableScrollbar top stretch className="settlement-panel">
                                <PanelOverview {...data}/>
                            </VBox>
                        </Then>
                    </If>

                    <If condition={selectedPanel === "Industry"}>
                        <Then>
                            <VBox scrollable gap_s stableScrollbar top stretch className="settlement-panel">
                                <PanelIndustry {...data}/>
                            </VBox>
                        </Then>
                    </If>

                    <If condition={selectedPanel === "Population"}>
                        <Then>
                            <VBox scrollable gap_s stableScrollbar top stretch className="settlement-panel">
                                <PanelPopulation {...data}/>
                            </VBox>
                        </Then>
                    </If>

                    <If condition={selectedPanel === "Debug"}>
                        <Then>
                            <VBox scrollable gap_s stableScrollbar top stretch className="settlement-panel">
                                <PanelDebug {...data}/>
                            </VBox>
                        </Then>
                    </If>

                </VBox>

            </DecoratedWindow>
        );
    }
}


function PanelOverview(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <InsetKeyValueGrid>

                <EnrichedText>Name:</EnrichedText>
                <EnrichedText>{props.settlement.identifier.name}</EnrichedText>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText>{props.settlement.country.name}</EnrichedText>

                <EnrichedText>Population:</EnrichedText>
                <EnrichedText>{props.settlement.population.size}</EnrichedText>

            </InsetKeyValueGrid>

            <Spacer size="s"/>
            <SectionRoutes {...props}/>
        </>
    );
}


function PanelIndustry(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionProduction {...props}/>

            <Spacer size={"s"}/>
            <SectionResourceBalance {...props}/>

            <Spacer size={"s"}/>
            <SectionBuildings {...props}/>
        </>
    );
}


function PanelPopulation(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionPopulationSize {...props}/>
            <Spacer size={"s"}/>
            <SectionGrowthOverview {...props}/>
        </>
    );
}

function PanelDebug(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <InsetKeyValueGrid>

                <EnrichedText>Settlement Id:</EnrichedText>
                <EnrichedText>{props.settlement.identifier.id}</EnrichedText>

                <EnrichedText>Country Id:</EnrichedText>
                <EnrichedText>{props.settlement.country.id}</EnrichedText>

                <EnrichedText>Tile:</EnrichedText>
                <EnrichedText>{props.settlement.tile.q + ", " + props.settlement.tile.r}</EnrichedText>

            </InsetKeyValueGrid>
        </>
    );
}

function SectionRoutes(props: UseSettlementWindow.Data): ReactElement {
    return (
        <VBox top stretch gap_xs>
            <Header2 centered>Connections</Header2>
            <Divider/>
            <InsetPanel>
                <VBox padding_xs gap_xs>
                    {props.settlement.routes.map(route => (
                        <DecoratedPanel
                            key={route.id}
                            simpleBorder
                            pattern
                            paddingSmall
                            accent="blue"
                            background={<DecoratedPanelColorBackground color={Color.toCss(route.targetCountry.color)}/>}
                        >
                            <HBox left gap_s>
                                <EnrichedText>
                                    <ETText>to</ETText>
                                    <ETSpacer size={"xs"}/>
                                    <ETLink onClick={() => props.open.settlement(route.targetSettlement.id)}>
                                        {route.targetSettlement.name}
                                    </ETLink>
                                </EnrichedText>
                            </HBox>
                        </DecoratedPanel>
                    ))}
                </VBox>
            </InsetPanel>
        </VBox>
    );
}

function SectionResourceBalance(props: UseSettlementWindow.Data) {
    return (
        <VBox top stretch gap_xs>
            <Header2 centered>Resource Balance</Header2>
            <Divider/>
            <InsetPanel>
                <If condition={props.settlement.resources.length > 0}>
                    <Then>
                        <HBox fillParent gap_s left wrap>
                            {props.settlement.resources.map(entry => (
                                <ResourceLedgerBox {...entry} key={entry.type}/>
                            ))}
                        </HBox>
                    </Then>
                    <Else>
                        <Text type="secondary">No resources present.</Text>
                    </Else>
                </If>
            </InsetPanel>
        </VBox>
    );
}

function SectionBuildings(props: UseSettlementWindow.Data) {
    return (
        <VBox top stretch gap_xs>
            <Header2 centered>Buildings</Header2>
            <Divider/>
            <InsetPanel>
                <If condition={props.settlement.buildings.length > 0}>
                    <Then>
                        <HBox fillParent gap_s left wrap>
                            {props.settlement.buildings.map((entry, i) => (
                                <BuildingBox building={entry} key={i}/>
                            ))}
                        </HBox>
                    </Then>
                    <Else>
                        <Text type="secondary">No buildings constructed.</Text>
                    </Else>
                </If>
            </InsetPanel>
        </VBox>
    );
}

function SectionProduction(props: UseSettlementWindow.Data): ReactElement {
    return (
        <VBox top stretch gap_xs>
            <Header2 centered>Production</Header2>
            <Divider/>

            <HBox centerVertical left gap_s>

                <ButtonPrimary square onClick={props.productionQueue.add}>
                    <FiPlus/>
                </ButtonPrimary>

                <ProgressBar
                    progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
                    onClick={props.productionQueue.open}
                    className="production_queue__progress"
                >
                    <Text relative>
                        {props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}
                    </Text>
                </ProgressBar>

                <ButtonPrimary square circle small onClick={props.productionQueue.cancel}>
                    <CgClose/>
                </ButtonPrimary>

            </HBox>

        </VBox>
    );
}

function SectionPopulationSize(props: UseSettlementWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid>

            <EnrichedText>Population Size:</EnrichedText>
            <EnrichedText>{props.settlement.population.size}</EnrichedText>

        </InsetKeyValueGrid>
    );
}


function SectionGrowthOverview(props: UseSettlementWindow.Data): ReactElement {
    const totalProgress = props.settlement.population.growth.value.progress;
    const lastProgress = 0.25; // todo: get actual value from server
    const expectedPopulationChange = totalProgress >= 0 ? +1 : -1;

    return (
        <VBox top stretch gap_xs>

            <Header2 centered>Growth</Header2>
            <Divider/>

            <HBox gap_s stretch centerVertical>
                <ProgressCircle totalProgress={totalProgress} currentChange={lastProgress}/>
                <InsetPanel growParent>
                    <VBox left centerVertical gap_xs>
                        <EnrichedText>
                            <ETNumber percentage unsigned>{totalProgress}</ETNumber>
                            <ETText> total progress until </ETText>
                            <ETNumber signed>{expectedPopulationChange}</ETNumber>
                            <ETText> population</ETText>
                        </EnrichedText>
                        <EnrichedText>
                            <ETNumber percentage signed>{lastProgress}</ETNumber>
                            <ETText> Growth last turn</ETText>
                        </EnrichedText>
                    </VBox>
                </InsetPanel>
            </HBox>

            <InsetPanel>
                <VBox padding_xs gap_xs>
                    {props.settlement.population.growth.value.details.map(detail => (
                        <DecoratedPanel
                            key={detail.key + "" + detail.amount}
                            accent="blue"
                            pattern
                            simpleBorder
                            paddingSmall
                            background={
                                <DecoratedPanelColorBackground
                                    color={detail.amount > 0 ? CSS_COLOR_SUCCESS_LIGHT : CSS_COLOR_WARN_LIGHT}
                                />
                            }
                        >
                            <EnrichedText>
                                <ETNumber percentage>{detail.amount}</ETNumber>
                                <ETSpacer size="xs"/>
                                <ETText>{detail.key}</ETText>
                            </EnrichedText>
                        </DecoratedPanel>
                    ))}
                </VBox>
            </InsetPanel>

        </VBox>
    );
}