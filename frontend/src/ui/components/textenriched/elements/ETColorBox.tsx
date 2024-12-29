import React, {ReactElement} from "react";
import "./etElements.scoped.less";
import {joinClassNames} from "../../window/utils";

export interface ETColorBoxProps {
    color: string,
    className?: string
}

export function ETColorBox(props: ETColorBoxProps): ReactElement {
    return (
        <span
            className={joinClassNames(["et-color-box"])}
            style={{
                backgroundColor: props.color
            }}
        />
    );
}