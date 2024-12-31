import React, {ReactElement} from "react";
import {UseOutlinerWindow} from "./useOutlinerWindow";
import {Header1} from "../../../../components/header/Header";
import {Divider} from "../../../../components/divider/Divider";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {arrayOfSize} from "../../../../../common/utils";

export interface OutlinerWindowProps {
    windowId: string,
}

export function OutlinerWindow(props: OutlinerWindowProps): ReactElement {

    const data = UseOutlinerWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox padding_l gap_m fullSize>

                <Header1 centered>Outliner</Header1>

                <Divider line/>

                <TabBar initial={"All"}>

                    <TabOption name="All">
                        <InsetPanel shrink>
                            <VBox scrollable padding_s gap_s fullSize>
                                <SectionSettlements {...data}/>
                                <SectionWorldObjects {...data}/>
                            </VBox>
                        </InsetPanel>
                    </TabOption>

                    <TabOption name="Settlements">
                        <InsetPanel shrink>
                            <VBox scrollable padding_s gap_s fullSize>
                                <SectionSettlements {...data}/>
                            </VBox>
                        </InsetPanel>
                    </TabOption>

                    <TabOption name="Units">
                        <InsetPanel shrink>
                            <VBox scrollable padding_s gap_s fullSize>
                                <SectionWorldObjects {...data}/>
                            </VBox>
                        </InsetPanel>
                    </TabOption>

                </TabBar>


            </VBox>
        </DecoratedWindow>
    );
}


function SectionSettlements(props: UseOutlinerWindow.Data): ReactElement {
    return (
        <>
            {props.settlements.length > 0 && (
                <Text>Settlements</Text>
            )}
            {props.settlements.map(settlement => (
                <DecoratedPanel
                    key={settlement.id}
                    pattern
                    blue
                >
                    <HBox fullSize gap_s padding_s>
                        <EnrichedText>
                            <ETLink onClick={() => props.openSettlement(settlement)}>
                                {settlement.name}
                            </ETLink>
                        </EnrichedText>
                    </HBox>
                </DecoratedPanel>
            ))}
        </>
    )
}

function SectionWorldObjects(props: UseOutlinerWindow.Data): ReactElement {
    return (
        <>
            {props.worldObjects.length > 0 && (
                <Text>Units</Text>
            )}
            {props.worldObjects.map(worldObject => (
                <DecoratedPanel
                    key={worldObject.id}
                    pattern
                    blue
                >
                    <HBox fullSize gap_s padding_s>
                        <EnrichedText>
                            <ETLink onClick={() => props.openWorldObject(worldObject)}>
                                {worldObject.type.id}
                            </ETLink>
                        </EnrichedText>
                    </HBox>
                </DecoratedPanel>
            ))}
        </>
    )
}