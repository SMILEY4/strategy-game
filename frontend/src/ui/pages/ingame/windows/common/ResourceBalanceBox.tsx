import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import {ResourceLedgerDetail, ResourceLedgerEntry} from "../../../../../models/resourceLedger";
import "./resourceBalanceBox.less";


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
                    <VBox padding_m gap_s fillParent>
                        <Header4>{props.data.resourceType.displayString}</Header4>
                        {props.data.details.sort(detailTypeSort).map(detail => (
                            <Text type={detail.type === "added" ? "positive" : "negative"}>
                                {detail.type === "added" && formatValue(detail.amount) + " " + detail.message}
                                {detail.type === "removed" && formatValue(-detail.amount) + " " + detail.message}
                                {detail.type === "missing" && detail.amount + " missing: " + detail.message}
                            </Text>
                        ))}
                    </VBox>
                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );
}

function detailTypeSort(a: ResourceLedgerDetail, b: ResourceLedgerDetail): number {
    const value = (e: ResourceLedgerDetail) => {
        switch (e.type) {
            case "added":
                return 1;
            case "removed":
                return 2;
            case "missing":
                return 3;
            default:
                return 10;
        }
    };
    return value(a) - value(b);
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

function formatValue(value: number): string {
    const simpleValue = Math.round(value * 100) / 100;
    if (simpleValue < 0) {
        return "-" + Math.abs(simpleValue);
    }
    if (simpleValue > 0) {
        return "+" + Math.abs(simpleValue);
    }
    return "0";
}