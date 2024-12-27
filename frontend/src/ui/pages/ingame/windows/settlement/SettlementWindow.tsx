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
import {If, Then} from "react-if";
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

export interface SettlementWindowProps {
    windowId: string;
    identifier: string | null;
}

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


                {/*<WindowSection title="Routes">*/}
                {/*    <InsetPanel>*/}
                {/*        {data.settlement.routes.map(route => {*/}
                {/*            return route.settlementA.id === data.settlement.identifier.id*/}
                {/*                ? <EnrichedText key={route.id}>{"-> " + route.settlementB.name}</EnrichedText>*/}
                {/*                : <EnrichedText key={route.id}>{"-> " + route.settlementA.name}</EnrichedText>;*/}
                {/*        })}*/}
                {/*    </InsetPanel>*/}
                {/*</WindowSection>*/}

                {/*<Spacer size="m"/>*/}

                {/*<WindowSection title={"Population"}>*/}
                {/*    <InsetPanel>*/}
                {/*        <InsetKeyValueGrid>*/}

                {/*            <EnrichedText>Size</EnrichedText>*/}
                {/*            <EnrichedText>{data.settlement.population.size}</EnrichedText>*/}

                {/*            <If condition={data.settlement.population.growth.visible}>*/}
                {/*                <Then>*/}
                {/*                    <EnrichedText>Growth Progress</EnrichedText>*/}
                {/*                    <EnrichedText><ETNumber*/}
                {/*                        percentage>{data.settlement.population.growth.value.progress}</ETNumber></EnrichedText>*/}

                {/*                    <EnrichedText>Details</EnrichedText>*/}
                {/*                    <ul>*/}
                {/*                        {data.settlement.population.growth.value.details.map(detail => (*/}
                {/*                            <li><EnrichedText>{detail.key} <ETNumber*/}
                {/*                                percentage>{detail.amount}</ETNumber></EnrichedText></li>*/}
                {/*                        ))}*/}
                {/*                    </ul>*/}


                {/*                </Then>*/}
                {/*            </If>*/}

                {/*        </InsetKeyValueGrid>*/}
                {/*    </InsetPanel>*/}
                {/*</WindowSection>*/}

                {/*<Spacer size="m"/>*/}

                {/*<WindowSection title={"Resources"}>*/}
                {/*    <ResourcesSection {...data}/>*/}
                {/*</WindowSection>*/}

                {/*<Spacer size="m"/>*/}

                {/*<WindowSection title={"Production"}>*/}
                {/*    <ProductionQueueSection {...data}/>*/}
                {/*</WindowSection>*/}

                {/*<Spacer size="m"/>*/}

                {/*<WindowSection title={"Buildings"}>*/}
                {/*    <BuildingList {...data}/>*/}
                {/*</WindowSection>*/}

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

            <Spacer size={"s"}/>
            <SectionResourceBalance {...props}/>

            <Spacer size={"s"}/>
            <SectionBuildings {...props}/>
        </>
    );
}


function PanelIndustry(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            <Spacer size={"s"}/>
            <SectionResourceBalance {...props}/>
        </>
    );
}


function PanelPopulation(props: UseSettlementWindow.Data): ReactElement {
    return (
        <>
            {Array.from(Array(100).keys()).map((_, i) => (
                <Text>{"Population Line " + i}</Text>
            ))}
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
                            simpleBorder
                            paddingSmall
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
                <HBox fillParent gap_s left wrap>
                    {props.settlement.resources.map(entry => (
                        <ResourceLedgerBox {...entry}/>
                    ))}
                </HBox>
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
                <HBox fillParent gap_s left wrap>
                    {props.settlement.buildings.map(entry => (
                        <BuildingBox building={entry}/>
                    ))}
                </HBox>
            </InsetPanel>
        </VBox>
    );
}
// function ProductionQueueSection(props: UseSettlementWindow.Data) {
//     return (
//         <HBox centerVertical left gap_s>
//             <ProductionQueueAddButton {...props}/>
//             <ProductionQueueProgressBar {...props}/>
//             <ProductionQueueCancelButton {...props}/>
//         </HBox>
//     );
// }
//
// function ProductionQueueAddButton(props: UseSettlementWindow.Data): ReactElement {
//     return (
//         <ButtonPrimary square onClick={props.productionQueue.add}>
//             <FiPlus/>
//         </ButtonPrimary>
//     );
// }
//
// function ProductionQueueProgressBar(props: UseSettlementWindow.Data): ReactElement {
//     return (
//         <ProgressBar
//             progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
//             onClick={props.productionQueue.open}
//             className="production_queue__progress"
//         >
//             <Text relative>
//                 {props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}
//             </Text>
//         </ProgressBar>
//     );
// }
//
// function ProductionQueueCancelButton(props: UseSettlementWindow.Data): ReactElement {
//     return (
//         <ButtonPrimary square circle small onClick={props.productionQueue.cancel}>
//             <CgClose/>
//         </ButtonPrimary>
//     );
// }
//
// function BuildingList(props: UseSettlementWindow.Data): ReactElement {
//     return (
//         <>
//             <HBox gap_s centerVertical left>
//                 <Text>{"Building-Slots: " + props.settlement.buildings.length + "/" + "?"}</Text>
//             </HBox>
//             <HBox gap_s top left wrap>
//                 {props.settlement.buildings.map((building, index) => (
//                     <BuildingEntry key={index} data={props} building={building}/>
//                 ))}
//             </HBox>
//         </>
//     );
// }
//
// function BuildingEntry(props: { data: UseSettlementWindow.Data, building: Building }): ReactElement {
//     return (
//         <BuildingInfoTooltip building={props.building}>
//             <div
//                 className={joinClassNames([
//                     "settlement-content-box",
//                     (props.building.validity.workTile && props.building.validity.inputResources) ? null : "settlement-content-box--disabled",
//                 ])}
//                 style={{
//                     backgroundImage: "url('" + "icons/production/" + props.building.type + ".png')",
//                 }}
//             />
//         </BuildingInfoTooltip>
//     );
// }
//
// function BuildingInfoTooltip(props: { building: Building, children?: any }) {
//     return (
//         <TooltipContext>
//             <TooltipTrigger>
//                 {props.children}
//             </TooltipTrigger>
//             <TooltipContent>
//                 <TooltipPanel>
//                     <VBox padding_m gap_s fillParent>
//
//                         <Header4>{props.building.type}</Header4>
//
//                         <If condition={props.building.activity.consumed.length > 0}>
//                             <Then>
//                                 {props.building.activity.consumed.map(entry => (
//                                     <EnrichedText key={entry.type}>
//                                         <ETNumber typeAuto signed>{-entry.amount}</ETNumber> {entry.type}
//                                     </EnrichedText>
//                                 ))}
//                             </Then>
//                         </If>
//
//                         <If condition={props.building.activity.produced.length > 0}>
//                             <Then>
//                                 {props.building.activity.produced.map(entry => (
//                                     <EnrichedText key={entry.type}>
//                                         <ETNumber typeAuto signed>{entry.amount}</ETNumber> {entry.type}
//                                     </EnrichedText>
//                                 ))}
//                             </Then>
//                         </If>
//
//
//                         <If condition={props.building.activity.missing.length > 0 || !props.building.validity.workTile}>
//                             <Then>
//                                 <Spacer size="s"/>
//                                 <EnrichedText>
//                                     Missing:
//                                 </EnrichedText>
//                                 {!props.building.validity.workTile && (
//                                     <EnrichedText style={{color: "hsl(0, 87%, 65%)"}}>
//                                         {"Tile to work on: " + props.building.workTile.requiredTerrain?.id + " " + props.building.workTile.requiredResource?.id}
//                                     </EnrichedText>
//                                 )}
//                                 {props.building.activity.missing.map(entry => (
//                                     <EnrichedText key={entry.type}>
//                                         <ETNumber neg unsigned>{entry.amount}</ETNumber> {entry.type}
//                                     </EnrichedText>
//                                 ))}
//                             </Then>
//                         </If>
//
//                     </VBox>
//                 </TooltipPanel>
//             </TooltipContent>
//         </TooltipContext>
//     );
// }