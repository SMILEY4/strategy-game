import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {UseSettlementWindow} from "./useSettlementWindow";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/primary/Button";
import "./settlementWindow.less";
import {Header2} from "../../../../components/header/Header";
import {Else, If, Then} from "react-if";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {Color} from "../../../../../models/base/color";
import {ETText} from "../../../../components/textenriched/elements/ETText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {ETSpacer} from "../../../../components/textenriched/elements/ETSpacer";
import {ResourceLedgerBox} from "./ResourceLedgerBox";
import {BuildingBox} from "./BuildingBox";
import {FiHexagon, FiPlus} from "react-icons/fi";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {CgClose} from "react-icons/cg";
import {CSS_COLOR_SUCCESS_LIGHT, CSS_COLOR_WARN_LIGHT} from "../../../../components/commonColors";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {ProgressCircle} from "./ProgressCircle";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";

export interface SettlementWindowProps {
    windowId: string;
    identifier: string | null;
}

export function SettlementWindow(props: SettlementWindowProps): ReactElement {

    const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox fullSize center>
                    <Text>No settlement selected.</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>
                <VBox fullSize>

                    <Banner
                        title={data.settlement.identifier.name}
                        subtitle={"Settlement"}
                        color={data.settlement.country.color}
                        spaceAbove
                    >
                        <Button circle small onClick={data.open.tile}><FiHexagon/></Button>
                    </Banner>

                    <TabBar initial="Overview">

                        <TabOption name="Overview">
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelOverview {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Industry">
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelIndustry {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Population">
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelPopulation {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="D" circle>
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelDebug {...data}/>
                            </VBox>
                        </TabOption>

                    </TabBar>

                </VBox>
            </DecoratedWindow>
        );
    }
}


function PanelOverview(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <InsetKeyValueGrid dontGrow dontShrink>

                <EnrichedText>Name:</EnrichedText>
                <EnrichedText>{props.settlement.identifier.name}</EnrichedText>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText>{props.settlement.country.name}</EnrichedText>

                <EnrichedText>Population:</EnrichedText>
                <EnrichedText>{props.settlement.population.size}</EnrichedText>

            </InsetKeyValueGrid>

            <VSpacer size_s/>

            <SectionRoutes {...props}/>
        </>
    );
}


function PanelIndustry(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionProduction {...props}/>
            <VSpacer size_s/>
            <SectionResourceBalance {...props}/>
            <VSpacer size_s/>
            <SectionBuildings {...props}/>
        </>
    );
}


function PanelPopulation(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionPopulationSize {...props}/>
            <VSpacer size_s/>
            <SectionGrowthOverview {...props}/>
        </>
    );
}

function PanelDebug(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <InsetKeyValueGrid dontShrink dontGrow>

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
        <>
            <Header2 centered>Connections</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <VBox padding_xs gap_xs fullSize>
                    {props.settlement.routes.map(route => (

                        <DecoratedPanel
                            key={route.id}
                            pattern
                            blue
                            background={<DecoratedPanel.ColorBackground
                                color={Color.toCss(route.targetCountry.color)}/>}
                        >
                            <HBox fullSize padding_s gap_s>
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
        </>
    );
}

function SectionResourceBalance(props: UseSettlementWindow.Data) {
    return (
        <>
            <Header2 centered>Resource Balance</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <If condition={props.settlement.resources.length > 0}>
                    <Then>
                        <HBox fullSize padding_s gap_s left wrap>
                            {props.settlement.resources.map(entry => (
                                <ResourceLedgerBox {...entry} key={entry.type}/>
                            ))}
                        </HBox>
                    </Then>
                    <Else>
                        <Text secondary center>No resources present.</Text>
                    </Else>
                </If>
            </InsetPanel>
        </>
    );
}

function SectionBuildings(props: UseSettlementWindow.Data) {
    return (
        <>
            <Header2 centered>Buildings</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <If condition={props.settlement.buildings.length > 0}>
                    <Then>
                        <HBox fullSize padding_s gap_s left wrap>
                            {props.settlement.buildings.map((entry, i) => (
                                <BuildingBox building={entry} key={i}/>
                            ))}
                        </HBox>
                    </Then>
                    <Else>
                        <Text secondary center>No buildings constructed.</Text>
                    </Else>
                </If>

            </InsetPanel>
        </>
    );
}

function SectionProduction(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <Header2 centered>Production</Header2>
            <Divider line/>

            <HBox dontShrink dontGrow centerVertical left gap_s>

                <Button square onClick={props.productionQueue.add}><FiPlus/></Button>

                <ProgressBar
                    progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
                    onClick={props.productionQueue.open}
                    className="production_queue__progress"
                >
                    <Text>
                        {props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}
                    </Text>
                </ProgressBar>

                <Button square circle small onClick={props.productionQueue.cancel}><CgClose/></Button>

            </HBox>

        </>
    );
}

function SectionPopulationSize(props: UseSettlementWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid dontGrow dontShrink>

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
        <>

            <Header2 centered>Growth</Header2>
            <Divider line/>

            <HBox gap_s stretch centerVertical>
                <ProgressCircle totalProgress={totalProgress} currentChange={lastProgress}/>
                <InsetPanel grow shrink>
                    <VBox left centerVertical padding_s gap_xs>
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

            <InsetPanel dontShrink dontGrow>
                <VBox padding_s gap_s>
                    {props.settlement.population.growth.value.details.map(detail => (
                        <DecoratedPanel
                            key={detail.key + "" + detail.amount}
                            blue
                            pattern
                            background={
                                <DecoratedPanel.ColorBackground
                                    color={detail.amount > 0 ? CSS_COLOR_SUCCESS_LIGHT : CSS_COLOR_WARN_LIGHT}
                                />
                            }
                        >
                            <HBox padding_s>
                                <EnrichedText>
                                    <ETNumber percentage>{detail.amount}</ETNumber>
                                    <ETSpacer size="xs"/>
                                    <ETText>{detail.key}</ETText>
                                </EnrichedText>
                            </HBox>
                        </DecoratedPanel>
                    ))}
                </VBox>
            </InsetPanel>

        </>
    );
}