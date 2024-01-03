import React, {ReactElement} from "react";
import "./etElements.scoped.less";
import {useButton, UseButtonProps} from "../../headless/useButton";

export interface ETLinkProps extends UseButtonProps{
    children?: any;
}

export function ETLink(props: ETLinkProps): ReactElement {
    const {elementProps, isDisabled} = useButton(props)

    return (
        <span {...elementProps} className={"et-link"}>{props.children}</span>
    );
}