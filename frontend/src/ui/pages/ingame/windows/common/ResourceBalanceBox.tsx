import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4, Header5} from "../../../../components/header/Header";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import {
    RESOURCE_LEDGER_DETAIL_TYPE_CLASSIFICATIONS,
    ResourceLedgerDetailType,
    ResourceLedgerEntry,
} from "../../../../../models/resourceLedger";
import "./resourceBalanceBox.less";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {DetailLogEntry} from "../../../../../models/detailLogEntry";
import {orDefault} from "../../../../../shared/utils";
import {BuildingType} from "../../../../../models/buildingType";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";


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

    const productionDetails = props.data.details.filter(d => RESOURCE_LEDGER_DETAIL_TYPE_CLASSIFICATIONS[d.id] == "production");
    const consumptionDetails = props.data.details.filter(d => RESOURCE_LEDGER_DETAIL_TYPE_CLASSIFICATIONS[d.id] == "consumption");
    const missingDetails = props.data.details.filter(d => RESOURCE_LEDGER_DETAIL_TYPE_CLASSIFICATIONS[d.id] == "missing");

    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>
                    <VBox padding_m gap_xs fillParent>
                        <Header4>{props.data.resourceType.displayString}</Header4>
                        {(productionDetails.length > 0 || consumptionDetails.length > 0) && (
                            <>
                                <SimpleDivider/>
                                <Header5>Balance</Header5>
                                {consumptionDetails.map(d => buildEntry(d))}
                                {productionDetails.map(d => buildEntry(d))}
                            </>
                        )}
                        {missingDetails.length > 0 && (
                            <>
                                <SimpleDivider/>
                                <Header5>Missing</Header5>
                                {missingDetails.map(d => buildEntry(d))}
                            </>
                        )}
                    </VBox>
                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );

    function buildEntry(entry: DetailLogEntry<ResourceLedgerDetailType>): ReactElement {
        switch (entry.id) {
            case "UNKNOWN_CONSUMPTION":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>unknown</Text>
                    </HBox>
                );
            case "UNKNOWN_PRODUCTION":
                return (
                    <HBox gap_xs>
                        <Text type="positive">{"+" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>unknown</Text>
                    </HBox>
                );
            case "UNKNOWN_MISSING":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{formatValue(entry.data["amount"], false)}</Text>
                        <Text>unknown</Text>
                    </HBox>
                );
            case "BUILDING_CONSUMPTION":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>{BuildingType.fromString(entry.data["buildingType"]).displayString}</Text>
                    </HBox>
                );
            case "BUILDING_PRODUCTION":
                return (
                    <HBox gap_xs>
                        <Text type="positive">{"+" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>{BuildingType.fromString(entry.data["buildingType"]).displayString}</Text>
                    </HBox>
                );
            case "BUILDING_MISSING":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{formatValue(entry.data["amount"], false)}</Text>
                        <Text>{BuildingType.fromString(entry.data["buildingType"]).displayString}</Text>
                    </HBox>
                );
            case "POPULATION_BASE_CONSUMPTION":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>basic population needs</Text>
                    </HBox>
                );
            case "POPULATION_BASE_MISSING":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{formatValue(entry.data["amount"], false)}</Text>
                        <Text>basic population needs</Text>
                    </HBox>
                );
            case "POPULATION_GROWTH_CONSUMPTION":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>basic growth</Text>
                    </HBox>
                );
            case "POPULATION_GROWTH_MISSING":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{formatValue(entry.data["amount"], false)}</Text>
                        <Text>basic growth</Text>
                    </HBox>
                );
            case "PRODUCTION_QUEUE_CONSUMPTION":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>{"production queue(s)" + " (" + orDefault(entry.data["count"], 1) + "x)"}</Text>
                    </HBox>
                );
            case "PRODUCTION_QUEUE_MISSING":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{formatValue(entry.data["amount"], false)}</Text>
                        <Text>{"production queue(s)" + " (" + orDefault(entry.data["count"], 1) + "x)"}</Text>
                    </HBox>
                );
            case "PRODUCTION_QUEUE_REFUND":
                return (
                    <HBox gap_xs>
                        <Text type="positive">{"+" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>refund production queue entry</Text>
                    </HBox>
                );
            case "SHARED_GIVE":
                return (
                    <HBox gap_xs>
                        <Text type="negative">{"-" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>trade</Text>
                    </HBox>
                );
            case "SHARED_TAKE":
                return (
                    <HBox gap_xs>
                        <Text type="positive">{"+" + formatValue(entry.data["amount"], false)}</Text>
                        <Text>trade</Text>
                    </HBox>
                );
        }
    }

}


function getValueType(entry: ResourceLedgerEntry): "positive" | "negative" | undefined {
    if (entry.amount > 0 && entry.missing === 0) {
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