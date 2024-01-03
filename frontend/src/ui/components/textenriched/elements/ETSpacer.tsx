import React, {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./etElements.scoped.less";

export interface ETSpacerProps {
    className?: string,
    size: "none" | "xs" | "s" | "m" | "l" | "fill"
}

export function ETSpacer(props: ETSpacerProps): ReactElement {
    return (
        <span className={joinClassNames(["et-spacer", "et-spacer--" + props.size, props.className])}/>
    );
}