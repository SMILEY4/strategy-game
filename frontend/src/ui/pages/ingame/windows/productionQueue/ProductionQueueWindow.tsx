import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {Button} from "../../../../components/button/primary/Button";
import {UseProductionQueueWindow} from "./useProductionQueueWindow";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AudioType} from "../../../../../common/audioService";
import {CgClose} from "react-icons/cg";
import {ProductionQueueEntry} from "../../../../../models/base/Settlement";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Header1} from "../../../../components/header/Header";

export interface ProductionQueueWindowProps {
    windowId: string;
    settlementId: string;
}

export function ProductionQueueWindow(props: ProductionQueueWindowProps): ReactElement {
    const data: UseProductionQueueWindow.Data = UseProductionQueueWindow.useData(props.settlementId);

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox padding_l gap_m fullSize>

                <VBox dontShrink dontGrow>
                    <Header1>Production</Header1>
                    <Text>{data.settlement.name}</Text>
                </VBox>

                <InsetPanel shrink grow>
                    <VBox fullSize gap_s padding_s scrollable>

                        {data.entries.length === 0 && (
                            <Text secondary>Nothing in queue.</Text>
                        )}

                        {data.entries.map((entry, index) => (
                            <QueueEntry
                                key={entry.entryId}
                                data={data}
                                entry={entry}
                                position={index + 1}
                            />
                        ))}

                    </VBox>
                </InsetPanel>

            </VBox>
        </DecoratedWindow>
    );
}


function QueueEntry(props: {
    data: UseProductionQueueWindow.Data,
    entry: ProductionQueueEntry,
    position: number
}): ReactElement {
    return (
        <DecoratedPanel
            className="queue-entry"
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
            <HBox fullSize centerVertical spaceBetween gap_s padding_s>

                <Text
                    grow
                    shrink
                    secondary={props.entry.isCommand}
                    className="queue-entry__name"
                >
                    {props.position + ". " + props.entry.type}
                </Text>

                {!props.entry.isCommand && props.position === 1 && (
                    <ProgressBar
                        dontGrow
                        dontShrink
                        small
                        border
                        progress={props.entry.progress}
                        className="queue-entry__progress"
                    />
                )}

                <Button
                    className="queue-entry__add"
                    square circle small
                    onClick={() => props.data.cancel(props.entry)}
                    soundId={AudioType.CLICK_CLOSE.id}
                >
                    <CgClose/>
                </Button>

            </HBox>
        </DecoratedPanel>
    );
}