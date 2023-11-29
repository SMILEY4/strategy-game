import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4, Header5} from "../../../../components/header/Header";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import {ResourceLedgerEntry} from "../../../../../models/resourceLedger";
import "./resourceBalanceBox.less";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Spacer} from "../../../../components/spacer/Spacer";


export function ResourceBalanceBox(props: { data: ResourceLedgerEntry }) {
    return (
        <>
            <InsetPanel className="resource-box">
                <ResourceBalanceTooltip data={props.data}>
                    <div
                        className="resource-box__icon"
                        style={{backgroundImage: "url('" + props.data.resourceType.icon + "')"}}
                    />
                </ResourceBalanceTooltip>
                <ResourceBalanceValue {...props.data}/>
            </InsetPanel>
        </>
    );


}

function ResourceBalanceValue(props: ResourceLedgerEntry): ReactElement {
    return (
        <Text
            className="resource-box__text"
            type={getValueType(props)}
        >
            {formatValue(props.amount)}
        </Text>
    );
}

function ResourceBalanceTooltip(props: { data: ResourceLedgerEntry, children?: any }) {
    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>
                    <VBox padding_m gap_xs fillParent>
                        <Header4>{props.data.resourceType.displayString}</Header4>
                        <Spacer size={"s"}/>
                        {props.data.details.filter(d => d.type === "added").map(detail => (
                            <HBox gap_xs>
                                <Text type="positive">{formatValue(detail.amount)}</Text>
                                <Text>{detail.message}</Text>
                            </HBox>
                        ))}
                        {props.data.details.filter(d => d.type === "removed").map(detail => (
                            <HBox gap_xs>
                                <Text type="negative">{formatValue(-detail.amount)}</Text>
                                <Text>{detail.message}</Text>
                            </HBox>
                        ))}
                        {props.data.details.some(d => d.type === "missing") && (
                            <>
                                <SimpleDivider/>
                                <Header5>Missing</Header5>
                            </>
                        )}
                        {props.data.details.filter(d => d.type === "missing").map(detail => (
                            <HBox gap_xs>
                                <Text type="negative">{formatValue(detail.amount, false)}</Text>
                                <Text type="secondary">{detail.message}</Text>
                            </HBox>
                        ))}
                    </VBox>
                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );
}


function getValueType(entry: ResourceLedgerEntry): "positive" | "negative" | undefined {
    if (entry.amount > 0 && entry.missing < 0) {
        return "positive";
    }
    if (entry.amount === 0 && entry.missing === 0) {
        return undefined;
    }
    if (entry.missing > 0) {
        return "negative";
    }
    return undefined;
}

function formatValue(value: number, includePlus?: boolean): string {
    const simpleValue = Math.round(value * 100) / 100;
    if (simpleValue < 0) {
        return "-" + Math.abs(simpleValue);
    }
    if (simpleValue > 0) {
        if (includePlus === false) {
            return "" + Math.abs(simpleValue);
        } else {
            return "+" + Math.abs(simpleValue);
        }
    }
    return "0";
}