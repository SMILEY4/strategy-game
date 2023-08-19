import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./spacer.scoped.less";

export interface SpacerProps {
    className?: string,
    size: "none" | "xs" | "s" | "m" | "l" | "xl" | "xxl" | "fill"
}

export function Spacer(props: SpacerProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "spacer",
                "spacer--" + props.size,
                props.className,
            ])}
        />
    );
}