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
import {HSpacer} from "../../../../components/spacer/Spacer";
import {Button} from "../../../../components/button/primary/Button";
import {RxEyeOpen} from "react-icons/rx";

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
                                <SectionCountries {...data}/>
                                <SectionSettlements {...data}/>
                                <SectionWorldObjects {...data}/>
                            </VBox>
                        </InsetPanel>
                    </TabOption>

                    <TabOption name="Countries">
                        <InsetPanel shrink>
                            <VBox scrollable padding_s gap_s fullSize>
                                <SectionCountries {...data}/>
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

function SectionCountries(props: UseOutlinerWindow.Data): ReactElement {
    return (
        <>
            {props.countries.entries.length > 0 && (
                <Text>Countries</Text>
            )}
            {props.countries.entries.map(country => (
                <DecoratedPanel
                    key={country.identifier.id}
                    pattern
                    blue
                >
                    <HBox fullSize gap_s padding_s>
                        <EnrichedText>
                            <ETLink disabled onClick={() => props.countries.open(country)}>
                                {country.identifier.name}
                            </ETLink>
                        </EnrichedText>
                        <HSpacer grow/>
                        <Button circle small disabled onClick={() => props.countries.focusCamera(country)}>
                            <RxEyeOpen/>
                        </Button>
                    </HBox>
                </DecoratedPanel>
            ))}
        </>
    );
}

function SectionSettlements(props: UseOutlinerWindow.Data): ReactElement {
    return (
        <>
            {props.settlements.entries.length > 0 && (
                <Text>Settlements</Text>
            )}
            {props.settlements.entries.map(settlement => (
                <DecoratedPanel
                    key={settlement.identifier.id}
                    pattern
                    blue
                >
                    <HBox fullSize gap_s padding_s>
                        <EnrichedText>
                            <ETLink onClick={() => props.settlements.open(settlement)}>
                                {settlement.identifier.name}
                            </ETLink>
                        </EnrichedText>
                        <HSpacer grow/>
                        <Button circle small onClick={() => props.settlements.focusCamera(settlement)}>
                            <RxEyeOpen/>
                        </Button>
                    </HBox>
                </DecoratedPanel>
            ))}
        </>
    );
}

function SectionWorldObjects(props: UseOutlinerWindow.Data): ReactElement {
    return (
        <>
            {props.worldObjects.entries.length > 0 && (
                <Text>Units</Text>
            )}
            {props.worldObjects.entries.map(worldObject => (
                <DecoratedPanel
                    key={worldObject.identifier.id}
                    pattern
                    blue
                >
                    <HBox fullSize gap_s padding_s>
                        <EnrichedText>
                            <ETLink onClick={() => props.worldObjects.open(worldObject)}>
                                {worldObject.identifier.type.id}
                            </ETLink>
                        </EnrichedText>
                        <HSpacer grow/>
                        <Button circle small onClick={() => props.worldObjects.focusCamera(worldObject)}>
                            <RxEyeOpen/>
                        </Button>
                    </HBox>
                </DecoratedPanel>
            ))}
        </>
    );
}