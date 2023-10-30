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
import {formatNumber, joinClassNames} from "../../../../components/utils";
import {CityIdentifier} from "../../../../../models/city";
import {UseCityConstructionWindow} from "./useCityConstructionWindow";
import {ConstructionEntryView} from "../../../../../models/ConstructionEntry";
import "./cityConstructionWindow.less";

export interface CityConstructionWindowProps {
    windowId: string;
    city: CityIdentifier;
}

export function CityConstructionWindow(props: CityConstructionWindowProps): ReactElement {
    const data: UseCityConstructionWindow.Data = UseCityConstructionWindow.useData(props.city);

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
                <Header1>Construction</Header1>
                <Spacer size="s"/>
                <InsetPanel fillParent hideOverflow noPadding>
                    <VBox top stretch gap_xs padding_s scrollable fillParent>
                        {data.entries.map(entry => (
                            <ConstructionListEntry data={data} entry={entry}/>
                        ))}
                    </VBox>
                </InsetPanel>
            </VBox>
        </DecoratedWindow>
    );
}


function ConstructionListEntry(props: { data: UseCityConstructionWindow.Data, entry: ConstructionEntryView }) {
    return (
        <DecoratedPanel
            simpleBorder paddingSmall blue
            className={joinClassNames([
                "construction-entry",
                props.entry.disabled ? "construction-entry--disabled" : null,
            ])}
            background={
                <div
                    className="construction-entry-background"
                    style={{backgroundImage: "url('" + props.entry.entry.icon + "')"}}
                />
            }
        >
            <HBox centerVertical gap_s>
                <Text className="construction-entry__name">
                    {props.entry.entry.displayString}
                </Text>
                <Text className="construction-entry__count">
                    {formatNumber(props.entry.queueCount, true, true)}
                </Text>
                <ButtonPrimary
                    blue small
                    className={"construction-entry__button"}
                    disabled={props.entry.disabled}
                    onClick={() => props.data.addEntry(props.entry.entry)}
                >
                    Add
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}
