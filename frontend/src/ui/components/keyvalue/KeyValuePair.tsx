import React, {ReactElement} from "react";
import {HBox} from "../layout/hbox/HBox";
import {Text} from "../text/Text";
import {joinClassNames} from "../utils";
import {LinkButton} from "../button/link/LinkButton";
import "./keyValuePair.less"

export interface KeyValuePairProps {
    name: string,
    className?: string,
    children?: any,
}

export function KeyValuePair(props: KeyValuePairProps): ReactElement {
    return (
        <HBox gap_s centerVertical className={joinClassNames(["key-value-pair", props.className])}>
            <Text fillParent align="right">{props.name + ":"}</Text>
            {props.children}
        </HBox>
    )
}



export interface KeyTextValuePairProps extends KeyValuePairProps{
    value: any
}

export function KeyTextValuePair(props: KeyTextValuePairProps) {
    return (
        <KeyValuePair name={props.name}>
            <Text fillParent align="left">{props.value}</Text>
        </KeyValuePair>
    )
}



export interface KeyLinkValuePairProps extends KeyValuePairProps{
    value: string,
    onClick?: () => void
}

export function KeyLinkValuePair(props: KeyLinkValuePairProps) {
    return (
        <KeyValuePair name={props.name}>
            <LinkButton fillParent align="left" onClick={props.onClick}>{props.value}</LinkButton>
        </KeyValuePair>
    )
}