import React, {ReactElement} from "react";
import {UseProductionWindow} from "./useProductionWindow";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedPanel, DecoratedPanelImageBackground} from "../../../../components/panels/decorated/DecoratedPanel";
import {formatNumber, joinClassNames} from "../../../../components/utils";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ChangeInfoText} from "../../../../components/info/ChangeInfoText";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import "./productionWindow.less";
import {ProductionOptionAggregate} from "../../../../../models/aggregates/SettlementAggregate";
import {Header} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";

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
            style={{
                minHeight: "200px",
            }}
        >
            <Header level={1}>{"Production"}</Header>
            <Spacer size="s"/>
            <InsetPanel fillParent hideOverflow noPadding>
                <VBox top stretch gap_xs padding_s scrollable fillParent>
                    {data.entries.map(entry => (
                        <ProductionListEntry
                            key={entry.type}
                            data={data}
                            entry={entry}
                        />
                    ))}
                </VBox>
            </InsetPanel>
        </DecoratedWindow>
    );
}


function ProductionListEntry(props: { data: UseProductionWindow.Data, entry: ProductionOptionAggregate }) {
    return (
        <DecoratedPanel
            simpleBorder paddingSmall
            className={joinClassNames([
                "production-entry",
                props.entry.available ? null : "production-entry--disabled",
            ])}
            background={
                <DecoratedPanelImageBackground
                    url={"icons/production/" + props.entry.type + ".png"}
					desaturated={!props.entry.available}
					reducedOpacity={!props.entry.available}
                />
            }
        >
            <HBox centerVertical gap_s>
                <Text className="production-entry__name">
                    {props.entry.type}
                </Text>
                <ChangeInfoText
                    className={"production-entry__count"}
                    prevValue={formatNumber(props.entry.queueCount, true, true)}
                    nextValue={formatNumber(props.entry.queueCount + props.entry.commandCount, true, true)}
                />
                <ButtonPrimary
                    info small
                    className={"production-entry__button"}
                    disabled={!props.entry.available}
                    onClick={() => props.data.produce(props.entry)}
                >
                    Add
                </ButtonPrimary>
            </HBox>
        </DecoratedPanel>
    );
}