import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text_basic/Text";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {UseSettlementWindow} from "./useSettlementWindow";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/Button";
import "./settlementWindow.less";
import {Header2} from "../../../../components/header/Header";
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
import {RxEyeOpen} from "react-icons/rx";

export interface SettlementWindowProps {
    windowId: string;
    identifier: string | null;
}

export function SettlementWindow(props: SettlementWindowProps): ReactElement {

    const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
                <VBox fullSize center>
                    <Text secondary>No settlement selected.</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding withPinButton>
                <VBox fullSize>

                    <Banner
                        title={data.settlement.identifier.name}
                        subtitle={"Settlement"}
                        color={data.settlement.country.color}
                        spaceAbove
                    >
                        <Button circle small onClick={data.open.tile}><FiHexagon/></Button>
                        <Button circle small onClick={data.centerCamera}><RxEyeOpen/></Button>
                    </Banner>

                    <TabBar initial="Overview">

                        <TabOption name="Overview">
                            <VBox grow shrink scrollable padding_s gap_m>
                                <PanelOverview {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Industry">
                            <VBox grow shrink scrollable padding_s gap_m>
                                <PanelIndustry {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Population">
                            <VBox grow shrink scrollable padding_s gap_m>
                                <PanelPopulation {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="D" circle>
                            <VBox grow shrink scrollable padding_s gap_m>
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
            <SectionBaseInfo {...props}/>
            <SectionRoutes {...props}/>
        </>
    );
}

function PanelIndustry(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionProduction {...props}/>
            <SectionResourceBalance {...props}/>
            <SectionBuildings {...props}/>
        </>
    );
}

function PanelPopulation(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <SectionPopulationSize {...props}/>
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


function SectionBaseInfo(props: UseSettlementWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid dontGrow dontShrink>

            <EnrichedText>Name:</EnrichedText>
            <EnrichedText>{props.settlement.identifier.name}</EnrichedText>

            <EnrichedText>Country:</EnrichedText>
            <EnrichedText>{props.settlement.country.name}</EnrichedText>

            <EnrichedText>Population:</EnrichedText>
            <EnrichedText>{props.settlement.population.size}</EnrichedText>

        </InsetKeyValueGrid>
    );
}

function SectionRoutes(props: UseSettlementWindow.Data): ReactElement {
    return (
        <VBox gap_s dontGrow dontShrink>

            <VSpacer size_s/>
            <Header2 centered>Connections</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <VBox padding_s gap_s fullSize>

                    {props.settlement.routes.length === 0 && (
                        <Text center secondary>No connected settlements.</Text>
                    )}

                    {props.settlement.routes.map(route => (
                        <DecoratedPanel
                            key={route.id}
                            pattern
                            blue
                            background={<DecoratedPanel.ColorBackground color={Color.toCss(route.targetCountry.color)}/>}
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
        </VBox>
    );
}

function SectionResourceBalance(props: UseSettlementWindow.Data) {
    return (
        <VBox gap_s dontGrow dontShrink>

            <VSpacer size_s/>
            <Header2 centered>Resource Balance</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <HBox padding_s gap_s left wrap fullSize>
                    {!props.settlement.resources.visible && (
                        <Text grow secondary>Unknown</Text>
                    )}
                    {(props.settlement.resources.visible && props.settlement.resources.value.length == 0) && (
                        <Text grow secondary>No resources.</Text>
                    )}
                    {(props.settlement.resources.visible && props.settlement.resources.value.length > 0) && props.settlement.resources.value.map(entry => (
                        <ResourceLedgerBox {...entry} key={entry.type}/>
                    ))}
                </HBox>
            </InsetPanel>
        </VBox>
    );
}

function SectionBuildings(props: UseSettlementWindow.Data) {
    return (
        <VBox gap_s dontGrow dontShrink>

            <VSpacer size_s/>
            <Header2 centered>Buildings</Header2>
            <Divider line/>

            <InsetPanel dontShrink dontGrow>
                <HBox padding_s gap_s left wrap fullSize>
                    {!props.settlement.buildings.visible && (
                        <Text grow secondary center>Unknown</Text>
                    )}
                    {(props.settlement.buildings.visible && props.settlement.buildings.value.length == 0) && (
                        <Text grow secondary center>No buildings constructed.</Text>
                    )}
                    {(props.settlement.buildings.visible && props.settlement.buildings.value.length > 0) && props.settlement.buildings.value.map((entry, i) => (
                        <BuildingBox building={entry} key={i}/>
                    ))}
                </HBox>
            </InsetPanel>
        </VBox>
    );
}

function SectionProduction(props: UseSettlementWindow.Data): ReactElement {
    return (
        <VBox gap_s dontGrow dontShrink>

            <VSpacer size_s/>
            <Header2 centered>Production</Header2>
            <Divider line/>

            {!props.settlement.production.queue.visible && (
                <Text secondary center>Unknown</Text>
            )}

            {props.settlement.production.queue.visible && (

                <HBox dontShrink dontGrow centerVertical left gap_s>

                    {props.settlement.country.isUserCountry && (
                        <Button square onClick={props.productionQueue.add}><FiPlus/></Button>
                    )}

                    <ProgressBar
                        grow
                        shrink
                        progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
                        onClick={props.productionQueue.open}
                        className="production_queue__progress"
                    >
                        <Text>
                            {props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}
                        </Text>
                    </ProgressBar>

                    {props.settlement.country.isUserCountry && (
                        <Button square circle small onClick={props.productionQueue.cancel}><CgClose/></Button>
                    )}

                </HBox>

            )}

        </VBox>
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
    const totalProgress = props.settlement.population.growth.value?.progress ?? 0;
    const lastProgress = props.settlement.population.growth.value?.amount ?? 0;
    const expectedPopulationChange = totalProgress >= 0 ? +1 : -1;

    return (
        <VBox gap_s dontGrow dontShrink>

            <VSpacer size_s/>
            <Header2 centered>Growth</Header2>
            <Divider line/>

            {!props.settlement.population.growth.visible && (
                <Text secondary center>Unknown</Text>
            )}

            {props.settlement.population.growth.visible && (
                <>
                    <HBox gap_s stretch centerVertical>
                        <ProgressCircle totalProgress={totalProgress} currentChange={lastProgress}/>
                        <InsetPanel grow shrink>
                            <VBox padding_s gap_xs left centerVertical fullSize>
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
                        <VBox padding_s gap_s fullSize>
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
            )}
        </VBox>
    );
}