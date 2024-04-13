import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import React, {ReactElement} from "react";
import {TooltipContent} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {Building, BuildingDetailType} from "../../../../../models/building";
import {DetailLogEntry} from "../../../../../models/detailLogEntry";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Text} from "../../../../components/text/Text";
import {ResourceType, ResourceTypeString} from "../../../../../models/resourceType";
import {SimpleDivider} from "../../../../components/divider/SimpleDivider";
import {TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";

const BUILDING_DETAIL_TYPE_ORDER: BuildingDetailType[] = [
    "WORKED_TILE",
    "ACTIVITY",
    "CONSUMED",
    "PRODUCED",
    "MISSING",
];

export function BuildingInfoTooltip(props: { building: Building, children?: any }) {
    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>

                    <VBox padding_m gap_s fillParent>
                        <Header4>{props.building.type.displayString}</Header4>
                        <SimpleDivider/>
                        {
                            props.building.details
                                .sort((a, b) => BUILDING_DETAIL_TYPE_ORDER.indexOf(a.id) - BUILDING_DETAIL_TYPE_ORDER.indexOf(b.id))
                                .map(d => buildDetail(d))
                        }
                    </VBox>

                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );

    function buildDetail(detail: DetailLogEntry<BuildingDetailType>): ReactElement | null {
        switch (detail.id) {
            case "WORKED_TILE":
                return (
                    <HBox gap_xs>
                        <Text>{"Tile " + detail.data["tile"].q + "," + detail.data["tile"].r}</Text>
                    </HBox>
                );
            case "ACTIVITY":
                return (
                    <HBox gap_xs>
                        <Text>Active:</Text>
                        <Text type={detail.data["active"] ? "positive" : "negative"}>{detail.data["active"] ? "Yes" : "No"}</Text>
                    </HBox>
                );
            case "CONSUMED": {
                if (detail.data["resources"].length > 0) {
                    return (
                        <VBox gap_xs>
                            <HBox gap_xs>
                                <Text>Consumed:</Text>
                            </HBox>
                            {detail.data["resources"].map((res: { type: ResourceTypeString, amount: number }) => {
                                return (
                                    <HBox gap_xs>
                                        <div style={{width: "0.5rem"}}/>
                                        <Text type="negative">{"-" + formatValue(res.amount, false)}</Text>
                                        <Text>{ResourceType.fromString(res.type).displayString}</Text>
                                    </HBox>
                                );
                            })}
                        </VBox>
                    );
                } else {
                    return null;
                }
            }
            case "PRODUCED": {
                if (detail.data["resources"].length > 0) {
                    return (
                        <VBox gap_xs>
                            <HBox gap_xs>
                                <Text>Produced:</Text>
                            </HBox>
                            {detail.data["resources"].map((res: { type: ResourceTypeString, amount: number }) => {
                                return (
                                    <HBox gap_xs>
                                        <div style={{width: "0.5rem"}}/>
                                        <Text type="positive">{"+" + formatValue(res.amount, false)}</Text>
                                        <Text>{ResourceType.fromString(res.type).displayString}</Text>
                                    </HBox>
                                );
                            })}
                        </VBox>
                    );
                } else {
                    return null;
                }
            }
            case "MISSING": {
                if (detail.data["resources"].length > 0) {
                    return (
                        <VBox gap_xs>
                            <HBox gap_xs>
                                <Text>Missing:</Text>
                            </HBox>
                            {detail.data["resources"].map((res: { type: ResourceTypeString, amount: number }) => {
                                return (
                                    <HBox gap_xs>
                                        <div style={{width: "0.5rem"}}/>
                                        <Text type="negative">{formatValue(res.amount, false)}</Text>
                                        <Text>{ResourceType.fromString(res.type).displayString}</Text>
                                    </HBox>
                                );
                            })}
                        </VBox>
                    );
                } else {
                    return null;
                }
            }
        }
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

}