import React, {ReactElement} from "react";
import "./etElements.scoped.less";
import {joinClassNames} from "../../window/utils";
import {PiScrollBold} from "react-icons/pi";

export interface ETIconProps {
    name: "command",
}

export function ETIcon(props: ETIconProps): ReactElement {

    if (props.name === "command") {
        return <PiScrollBold
            className={joinClassNames([
                "et-element",
                "et-icon",
            ])}
        />;
    }

    throw new Error("unknown icon name: " + props.name);
}