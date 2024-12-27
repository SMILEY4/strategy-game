import {ResourceLedgerEntry} from "../../../../../models/base/Settlement";
import React, {ReactElement} from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import {If, Then} from "react-if";
import "./resourceLedgerBox.less";

export function ResourceLedgerBox(props: ResourceLedgerEntry): ReactElement {

    return (
        <TooltipContext>
            <TooltipTrigger>
                <Box {...props}/>
            </TooltipTrigger>
            <TooltipContent>
                <Details {...props}/>
            </TooltipContent>
        </TooltipContext>
    );
}

function Box(props: ResourceLedgerEntry): ReactElement {
    return (
        <InsetPanel className="resource-ledger-box">
            <div
                className="resource-ledger-box__icon"
                style={{backgroundImage: "url('/icons/resources/" + props.type + ".png')"}}
            />
            <EnrichedText>
                <ETNumber>{props.amount}</ETNumber>
            </EnrichedText>
        </InsetPanel>
    );
}

function Details(props: ResourceLedgerEntry): ReactElement {
    return (
        <TooltipPanel>
            <VBox padding_m gap_xs fillParent>

                <Header4>{props.type}</Header4>

                <DetailSection
                    title="Produced"
                    format="signed"
                    type="pos"
                    amountMod={+1}
                    amount={props.produced.amount}
                    details={props.produced.details}
                />

                <DetailSection
                    title="Consumed"
                    format="signed"
                    type="neg"
                    amountMod={-1}
                    amount={props.consumed.amount}
                    details={props.consumed.details}
                />

                <DetailSection
                    title="Missing"
                    format="unsigned"
                    amountMod={+1}
                    type="neg"
                    amount={props.missing.amount}
                    details={props.missing.details}
                />

            </VBox>
        </TooltipPanel>
    );
}

function DetailSection(props: {
    title: string,
    format: "signed" | "signed-0p" | "signed-0n" | "unsigned"
    type: "none" | "pos" | "neg" | "info" | "auto" | "auto-inv",
    amountMod: 1 | -1,
    amount: number,
    details: ({ key: string, amount: number })[]
}) {

    return (
        <>
            <EnrichedText>
                <ETNumber typeAuto format={props.format}>{props.amount * props.amountMod}</ETNumber> {props.title}
            </EnrichedText>
            <If condition={props.details.length > 0}>
                <Then>
                    <InsetPanel>
                        <VBox padding_xs gap_xs>
                            {props.details.map(detail => (
                                <EnrichedText key={detail.key}>
                                    <ETNumber type={props.type}
                                              format={props.format}>{detail.amount * props.amountMod}</ETNumber> {detail.key}
                                </EnrichedText>
                            ))}
                        </VBox>
                    </InsetPanel>
                </Then>
            </If>
        </>
    );
}
