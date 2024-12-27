import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel, DecoratedPanelImageBackground} from "../../../../components/panels/decorated/DecoratedPanel";
import {joinClassNames} from "../../../../components/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {UseProductionQueueWindow} from "./useProductionQueueWindow";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AudioType} from "../../../../../common/audioService";
import {CgClose} from "react-icons/cg";
import "./productionQueueWindow.less";
import {ProductionQueueEntry} from "../../../../../models/base/Settlement";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";

export interface ProductionQueueWindowProps {
    windowId: string;
    settlementId: string;
}

export function ProductionQueueWindow(props: ProductionQueueWindowProps): ReactElement {
    const data: UseProductionQueueWindow.Data = UseProductionQueueWindow.useData(props.settlementId);

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox fillParent gap_s top stretch padding_xs>
                <Header1>Production Queue</Header1>
                <Spacer size={"s"}/>
                <InsetPanel fillParent hideOverflow noPadding>
                    <VBox top stretch gap_xs padding_s scrollable fillParent>
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
            className={joinClassNames(["queue-entry", props.entry.isCommand ? "queue-entry--command" : null])}
            background={
                <DecoratedPanelImageBackground
                    gradient
                    url={"url('" + "icons/production/" + props.entry.type + ".png"}
                    desaturated={props.entry.isCommand}
                />
            }
            simpleBorder paddingSmall
        >
            <HBox centerVertical spaceBetween gap_s>
                <Text className="queue-entry__name">{props.position + ". " + props.entry.type}</Text>
                {!props.entry.isCommand && props.position === 1 && (
                    <ProgressBar progress={props.entry.progress} className="production_queue__progress"/>)}
                <ButtonPrimary
                    square circle small
                    onClick={() => props.data.cancel(props.entry)}
                    soundId={AudioType.CLICK_CLOSE.id}
                >
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}