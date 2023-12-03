import React, {ReactElement} from "react";
import "./etElements.scoped.less";

export interface ETLinkProps {
    onClick?: () => void
    children?: any;
}

export function ETLink(props: ETLinkProps): ReactElement {
    return (
        <span className={"et-link"} onClick={props.onClick}>{props.children}</span>
    );
}