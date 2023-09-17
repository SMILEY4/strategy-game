import React from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import "./resourceBalanceBox.less";
import {ResourceBalance} from "../../../../../models/resource";


export function ResourceBalanceBox(props: { data: ResourceBalance }) {
    return (
        <>
            <InsetPanel className="resource-box">
                <ResourceBalanceTooltip data={props.data}>
                    <div
                        className="resource-box__icon"
                        style={{backgroundImage: "url('" + props.data.icon + "')"}}
                    />
                </ResourceBalanceTooltip>
                <Text
                    className="resource-box__text"
                    type={getValueType(props.data.value)}
                >
                    {formatValue(props.data.value)}
                </Text>
            </InsetPanel>
        </>
    );

    function formatValue(value: number): string {
        const simpleValue = Math.round(value * 100) / 100;
        if (simpleValue < 0) {
            return "" + simpleValue;
        }
        if (simpleValue > 0) {
            return "+" + simpleValue;
        }
        return "0";
    }

    function getValueType(value: number): "positive" | "negative" | undefined {
        if (value > 0) {
            return "positive";
        }
        if (value < 0) {
            return "negative";
        }
        return undefined;
    }

}

function ResourceBalanceTooltip(props: { data: ResourceBalance, children?: any }) {
    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>
                    <VBox padding_m gap_s fillParent>
                        <Header4>{props.data.name}</Header4>
                        {props.data.contributions.map(contribution => (
                            <Text type={contribution.value < 0 ? "negative" : "positive"}>
                                {(contribution.value < 0 ? "" : "+") + contribution.value + " " + contribution.reason}
                            </Text>
                        ))}
                    </VBox>
                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );
}