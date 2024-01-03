import React, {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./proportionBar.scoped.less";
import {Tooltip} from "../tooltip/Tooltip";
import {EnrichedText} from "../textenriched/EnrichedText";
import {VBox} from "../layout/vbox/VBox";
import {ETSpacer} from "../textenriched/elements/ETSpacer";
import {ETColorBox} from "../textenriched/elements/ETColorBox";

export type ProportionsBarColor = "blue" | "red" | "green" | "paper"

export interface ProportionBarEntry {
    name: string,
    value: number,
    color: string,
    className?: string
}

export interface ProportionBarProps {
    entries: ProportionBarEntry[]
    totalValue: number,
    emptyTooltip?: string
    color?: ProportionsBarColor
    className?: string
}

export function ProportionBar(props: ProportionBarProps): ReactElement {
    const entries = [...props.entries].sort((a, b) => b.value - a.value)
    return (
        <ProportionsBarTooltip entries={entries} emptyTooltip={props.emptyTooltip}>
            <div
                className={joinClassNames(["proportion-bar", "proportion-bar--" + (props.color || "red"), props.className])}>
                <div className={joinClassNames(["proportion-bar__inner"])}>
                    {entries.map(entry => (
                        <ProportionsBarEntry key={entry.name} totalValue={props.totalValue} entry={entry}/>
                    ))}
                </div>
            </div>
        </ProportionsBarTooltip>
    );
}

function ProportionsBarEntry(props: { totalValue: number, entry: ProportionBarEntry }): ReactElement {
    return (
        <div
            className={joinClassNames(["entry", props.entry.className])}
            style={{
                backgroundColor: props.entry.color,
                flexGrow: (props.entry.value / props.totalValue) * 100,
            }}
        />
    );
}

function ProportionsBarTooltip(props: { entries: ProportionBarEntry[], emptyTooltip?: string, children: any }): ReactElement {
    return (
        <Tooltip>
            <Tooltip.Trigger>
                {props.children}
            </Tooltip.Trigger>
            <Tooltip.Content>
                <VBox>
                    {props.entries.map(entry => (
                        <EnrichedText key={entry.name}>
                            <ETColorBox color={entry.color}/>
                            {entry.name + ":"}
                            <ETSpacer size={"s"}/>
                            <b>{entry.value}</b>
                        </EnrichedText>
                    ))}
                    {props.entries.length === 0 && props.emptyTooltip && (
                        <EnrichedText>{props.emptyTooltip}</EnrichedText>
                    )}
                </VBox>
            </Tooltip.Content>
        </Tooltip>
    );
}

