import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./enrichedText.scoped.less"

export interface EnrichedTextProps {
    children?: any;
    className?: string;
}

export function EnrichedText(props: EnrichedTextProps): ReactElement {
    return (
        <div className={joinClassNames(["enriched-text", props.className])}>
            {props.children}
        </div>
    );
}