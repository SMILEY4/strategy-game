import React, {ReactElement} from "react";
import {UseProductionWindow} from "./useProductionWindow";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {formatNumber} from "../../../../components/window/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {Button} from "../../../../components/button/Button";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";

export interface ProductionWindowProps {
    windowId: string;
    settlementId: string;
}

export function ProductionWindow(props: ProductionWindowProps): ReactElement {
    const data: UseProductionWindow.Data = UseProductionWindow.useData(props.settlementId);
    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            style={{minHeight: "200px"}}
        >
            <VBox padding_l gap_m fullSize>

                <VBox gap_xs dontShrink dontGrow>
                    <Txt.Header1>
                        <Txt.String>Production</Txt.String>
                    </Txt.Header1>
                    <Txt.Body>
                        <Txt.String>{data.settlement.name}</Txt.String>
                    </Txt.Body>
                </VBox>

                <Divider line/>

                {data.entries.length === 0 && (
                    <Txt.Body secondary center>
                        <Txt.String>Nothing available</Txt.String>
                    </Txt.Body>
                )}

                {data.entries.length > 0 && (
                    <InsetPanel shrink grow>
                        <VBox gap_s padding_s fullSize scrollable>

                            {data.entries.map(entry => (
                                <ProductionListEntry
                                    key={entry.type}
                                    data={data}
                                    entry={entry}
                                />
                            ))}

                        </VBox>
                    </InsetPanel>
                )}

            </VBox>
        </DecoratedWindow>
    );
}


function ProductionListEntry(props: { data: UseProductionWindow.Data, entry: ProductionOptionAggregate }) {
    return (
        <DecoratedPanel
            dontGrow
            dontShrink
            blue={props.entry.available}
            background={
                <DecoratedPanel.ImageBackground
                    gradient
                    url={"icons/production/" + props.entry.type + ".png"}
                    desaturated={!props.entry.available}
                    reducedOpacity={!props.entry.available}
                />
            }
        >
            <HBox gap_s padding_s fullSize>
                <Txt.Body grow shrink>
                    <Txt.String>{props.entry.type}</Txt.String>
                </Txt.Body>
                <ChangeInfoText
                    secondary
                    prevValue={formatNumber(props.entry.queueCount, true, true)}
                    nextValue={formatNumber(props.entry.queueCount + props.entry.commandCount, true, true)}
                />
                <Button
                    small
                    disabled={!props.entry.available}
                    onClick={() => props.data.produce(props.entry)}
                >
                    Add
                </Button>
            </HBox>
        </DecoratedPanel>
    );
}