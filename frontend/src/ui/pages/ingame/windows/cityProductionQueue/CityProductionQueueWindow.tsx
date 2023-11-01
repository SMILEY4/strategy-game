import {CityIdentifier} from "../../../../../models/city";
import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AudioType} from "../../../../../logic/audio/audioService";
import {UseCityProductionQueueWindow} from "./useCityProductionQueueWindow";
import {ProductionQueueEntryView} from "../../../../../models/productionQueueEntry";
import "./cityProductionQueueWindow.less";
import {joinClassNames} from "../../../../components/utils";

export interface CityProductionQueueWindowProps {
    windowId: string;
    city: CityIdentifier;
}

export function CityProductionQueueWindow(props: CityProductionQueueWindowProps): ReactElement {

    const data: UseCityProductionQueueWindow.Data = UseCityProductionQueueWindow.useData(props.city);

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            className={"window-city-production"}
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent gap_s top stretch>
                <Header1>Production Queue</Header1>
                <Spacer size="s"/>
                <InsetPanel fillParent hideOverflow noPadding>
                    <VBox top stretch gap_xs padding_s scrollable fillParent>

                        {data.queueEntries.map((entry, index) => (
                            <QueueEntry
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


function QueueEntry(props: { data: UseCityProductionQueueWindow.Data, entry: ProductionQueueEntryView, position: number }): ReactElement {
    return (
        <DecoratedPanel
            className={joinClassNames(["queue-entry", props.entry.command === null ? null : "queue-entry--command"])}
            background={
                <div
                    className={"queue-entry-background"}
                    style={{backgroundImage: "url('" + props.entry.entry.icon + "')"}}
                />
            }
            simpleBorder paddingSmall blue
        >
            <HBox centerVertical spaceBetween gap_s>
                <Text className="queue-entry__name">{props.position + ". " + props.entry.entry.displayName}</Text>
                {props.position === 1 && (<ProgressBar progress={props.entry.entry.progress} className="production_queue__progress"/>)}
                <ButtonPrimary
                    square round small
                    onClick={() => props.data.cancelEntry(props.entry)}
                    soundId={AudioType.CLICK_CLOSE.id}
                >
                    <CgClose/>
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}

