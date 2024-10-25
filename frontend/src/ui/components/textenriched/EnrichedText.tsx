import {CSSProperties, ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./enrichedText.scoped.less"

export interface EnrichedTextProps {
    children?: any;
    className?: string;
    style?: CSSProperties;
}

export function EnrichedText(props: EnrichedTextProps): ReactElement {
    return (
        <div className={joinClassNames(["enriched-text", props.className])} style={props.style}>
            {props.children}
        </div>
    );
}