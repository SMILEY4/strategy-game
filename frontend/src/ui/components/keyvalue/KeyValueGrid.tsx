import {ReactElement} from "react";
import "./keyValueGrid.scoped.less"
import {joinClassNames} from "../utils";

export interface KeyValueGridProps {
    className?: string,
    children?: any
}

export function KeyValueGrid(props: KeyValueGridProps): ReactElement {
    return (
        <div className={joinClassNames(["key-value-grid", props.className])}>
            {props.children}
        </div>
    )
}