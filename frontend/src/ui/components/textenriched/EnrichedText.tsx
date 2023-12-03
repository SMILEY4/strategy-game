import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./enrichedText.scoped.less"

export interface EnrichedTextBlockProps {
    children?: any;
    className?: string;
}

export function EnrichedText(props: EnrichedTextBlockProps): ReactElement {
    return (
        <div className={joinClassNames(["enriched-text", props.className])}>
            {props.children}
        </div>
    );
}