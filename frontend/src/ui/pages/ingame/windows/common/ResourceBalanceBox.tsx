import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
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
import {DetailLogEntry} from "../../../../../models/detailLogEntry";
import {BuildingType} from "../../../../../models/buildingType";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";


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
        <EnrichedText>
            <ETNumber>{props.amount}</ETNumber>
        </EnrichedText>
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
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> unknown
                    </EnrichedText>
                );
            case "UNKNOWN_PRODUCTION":
                return (
                    <EnrichedText>
                        <ETNumber>{entry.data["amount"]}</ETNumber> unknown
                    </EnrichedText>
                );
            case "UNKNOWN_MISSING":
                return (
                    <EnrichedText>
                        <ETNumber unsigned neg>{entry.data["amount"]}</ETNumber> unknown
                    </EnrichedText>
                );
            case "BUILDING_CONSUMPTION":
                return (
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> {BuildingType.fromString(entry.data["buildingType"]).displayString}
                    </EnrichedText>
                );
            case "BUILDING_PRODUCTION":
                return (
                    <EnrichedText>
                        <ETNumber>{entry.data["amount"]}</ETNumber> {BuildingType.fromString(entry.data["buildingType"]).displayString}
                    </EnrichedText>
                );
            case "BUILDING_MISSING":
                return (
                    <EnrichedText>
                        <ETNumber unsigned neg>{entry.data["amount"]}</ETNumber> {BuildingType.fromString(entry.data["buildingType"]).displayString}
                    </EnrichedText>
                );
            case "POPULATION_BASE_CONSUMPTION":
                return (
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> basic population needs
                    </EnrichedText>
                );
            case "POPULATION_BASE_MISSING":
                return (
                    <EnrichedText>
                        <ETNumber unsigned neg>{entry.data["amount"]}</ETNumber> basic population needs
                    </EnrichedText>
                );
            case "POPULATION_GROWTH_CONSUMPTION":
                return (
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> population growth
                    </EnrichedText>
                );
            case "POPULATION_GROWTH_MISSING":
                return (
                    <EnrichedText>
                        <ETNumber unsigned neg>{entry.data["amount"]}</ETNumber> population growth
                    </EnrichedText>
                );
            case "PRODUCTION_QUEUE_CONSUMPTION":
                return (
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> production queue
                    </EnrichedText>
                );
            case "PRODUCTION_QUEUE_MISSING":
                return (
                    <EnrichedText>
                        <ETNumber unsigned neg>{entry.data["amount"]}</ETNumber> production queue
                    </EnrichedText>
                );
            case "PRODUCTION_QUEUE_REFUND":
                return (
                    <EnrichedText>
                        <ETNumber>{entry.data["amount"]}</ETNumber> production queue refund
                    </EnrichedText>
                );
            case "SHARED_GIVE":
                return (
                    <EnrichedText>
                        <ETNumber>{-entry.data["amount"]}</ETNumber> trade
                    </EnrichedText>
                );
            case "SHARED_TAKE":
                return (
                    <EnrichedText>
                        <ETNumber>{entry.data["amount"]}</ETNumber> trade
                    </EnrichedText>
                );
        }
    }

}
