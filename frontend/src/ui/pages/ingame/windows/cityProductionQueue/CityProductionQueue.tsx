import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {CityIdentifier, ProductionQueueEntry} from "../../../../../models/city";
import React, {ReactElement} from "react";
import "./cityProductionQueue.less";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {CityRepository} from "../../../../../state/access/CityRepository";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {joinClassNames} from "../../../../components/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {AppCtx} from "../../../../../appContext";
import {CommandRepository} from "../../../../../state/access/CommandRepository";
import {CommandType} from "../../../../../models/commandType";
import {CancelProductionQueueCommand} from "../../../../../models/command";
import useCityById = CityRepository.useCityById;
import {AudioType} from "../../../../../logic/audio/audioService";

export function useOpenCityProductionQueueWindow() {
    const WINDOW_ID = "city-production-queue";
    const addWindow = useOpenWindow();
    return (city: CityIdentifier) => {
        addWindow({
            id: WINDOW_ID,
            className: "city-production-queue",
            left: 350,
            top: 350,
            width: 350,
            height: 400,
            content: <CityProductionQueueWindow windowId={WINDOW_ID} city={city}/>,
        });
    };
}

export interface CityProductionQueueWindowProps {
    windowId: string;
    city: CityIdentifier;
}

export function CityProductionQueueWindow(props: CityProductionQueueWindowProps): ReactElement {

    const city = useCityById(props.city.id);
    const queueEntries = city.productionQueue;
    const cancelEntry = useCancelEntry(props.city);
    const cancelCommands = CommandRepository.useCommands()
        .filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL)
        .map(cmd => cmd as CancelProductionQueueCommand);

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
                        {queueEntries.map((entry, index) => (
                            <QueueEntry
                                position={index + 1}
                                entry={entry}
                                cancelled={isCancelled(entry, cancelCommands)}
                                onCancel={() => cancelEntry(entry)}
                            />
                        ))}
                    </VBox>
                </InsetPanel>
            </VBox>
        </DecoratedWindow>
    );
}


function QueueEntry(props: { position: number, entry: ProductionQueueEntry, cancelled: boolean, onCancel: () => void }): ReactElement {
    return (
        <DecoratedPanel
            className={joinClassNames([
                "queue-entry",
                props.cancelled ? "queue-entry--cancelled" : null,
            ])}
            background={
                <div
                    className={"queue-entry-background"}
                    style={{backgroundImage: "url('" + getIcon(props.entry) + "')"}}
                />
            }
            simpleBorder paddingSmall blue
        >
            <HBox centerVertical spaceBetween gap_s>
                <Text strikethrough={props.cancelled}>{props.position + ") " + getName(props.entry)}</Text>
                {props.position === 1 && (<ProgressBar progress={props.entry.progress} className="production_queue__progress"/>)}
                <ButtonPrimary square round small onClick={props.onCancel} disabled={props.cancelled} soundId={AudioType.CLICK_B.id}><CgClose/></ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );

}


function getIcon(entry: ProductionQueueEntry): string {
    switch (entry.type) {
        case "building":
            return entry.buildingData!.type.icon;
        case "settler":
            return "/icons/buildings/farm.png";

    }
}

function getName(entry: ProductionQueueEntry): string {
    switch (entry.type) {
        case "building":
            return entry.buildingData!.type.displayString;
        case "settler":
            return "Settler";

    }
}

function isCancelled(entry: ProductionQueueEntry, commands: CancelProductionQueueCommand[]): boolean {
    return commands.some(cmd => cmd.entry.id === entry.id);
}

function useCancelEntry(city: CityIdentifier) {
    const commandService = AppCtx.CommandService();
    return (entry: ProductionQueueEntry) => {
        commandService.cancelProductionQueueEntry(city, entry);
    };
}
