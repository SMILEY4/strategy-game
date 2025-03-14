import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/Button";
import {UseProductionQueueWindow} from "./useProductionQueueWindow";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AudioType} from "../../../../../common/audioService";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {SettlementSummary} from "../../../../../models/settlement/settlementSummary";
import {SettlementProductionQueueEntry} from "../../../../../models/settlement/settlement";

export interface ProductionQueueWindowProps {
    windowId: string;
    settlement: SettlementSummary;
}

export function ProductionQueueWindow(props: ProductionQueueWindowProps): ReactElement {
    const data: UseProductionQueueWindow.Data = UseProductionQueueWindow.useData(props.settlement);

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox padding_l gap_m fullSize>

                <VBox gap_xs dontShrink dontGrow>
                    <Txt.Header1>
                        <Txt.String>Production Queue</Txt.String>
                    </Txt.Header1>
                    <Txt.Body>
                        <Txt.String>{data.settlement.name}</Txt.String>
                    </Txt.Body>
                </VBox>

                <Divider line/>

                {data.entries.length === 0 && (
                    <Txt.Body secondary center>
                        <Txt.String>Nothing in queue</Txt.String>
                    </Txt.Body>
                )}

                {data.entries.length > 0 && (
                    <InsetPanel shrink grow>
                        <VBox gap_s padding_s fullSize scrollable>

                            {data.entries.map((entry, index) => (
                                <QueueEntry
                                    key={entry.id}
                                    data={data}
                                    entry={entry}
                                    position={index + 1}
                                />
                            ))}

                        </VBox>
                    </InsetPanel>
                )}

            </VBox>
        </DecoratedWindow>
    );
}


function QueueEntry(props: {
    data: UseProductionQueueWindow.Data,
    entry: SettlementProductionQueueEntry,
    position: number
}): ReactElement {
    return (
        <DecoratedPanel
            dontGrow
            dontShrink
            simpleDashed={props.entry.isCommand}
            simple={!props.entry.isCommand}
            background={
                <DecoratedPanel.ImageBackground
                    gradient
                    url={"icons/production/" + props.entry.type + ".png"}
                    desaturated={props.entry.isCommand}
                />
            }
        >
            <HBox padding_s gap_s centerVertical spaceBetween fullSize>

                <Txt.Body grow shrink secondary={props.entry.isCommand}>
                    <Txt.String>{props.position + ". " + props.entry.type}</Txt.String>
                </Txt.Body>

                {!props.entry.isCommand && props.position === 1 && (
                    <ProgressBar
                        dontGrow
                        dontShrink
                        small
                        border
                        progress={props.entry.progress}
                    />
                )}

                {props.data.settlement.isUserControlled && (
                    <Button
                        square circle small
                        onClick={() => props.data.cancel(props.entry)}
                        soundId={AudioType.CLICK_CLOSE.id}
                    >
                        <Txt.Icon.Close/>
                    </Button>
                )}

            </HBox>
        </DecoratedPanel>
    );
}