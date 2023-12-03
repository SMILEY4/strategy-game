import {ReactElement} from "react";
import "./keyValueGrid.scoped.less";
import {joinClassNames} from "../utils";
import {InsetPanel} from "../panels/inset/InsetPanel";

export interface KeyValueGridProps {
    className?: string,
    children?: any
}

export function KeyValueGrid(props: KeyValueGridProps): ReactElement {
    return (
        <div className={joinClassNames(["key-value-grid", props.className])}>
            {props.children}
        </div>
    );
}

export function InsetKeyValueGrid(props: KeyValueGridProps): ReactElement {
    return (
        <InsetPanel>
            <KeyValueGrid {...props}/>
        </InsetPanel>
    );
}