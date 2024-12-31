import {ReactElement} from "react";
import "./keyValueGrid.scoped.less";
import {joinClassNames} from "../window/utils";
import {InsetPanel} from "../panels/inset/InsetPanel";
import {BaseProps} from "../base/base";

export interface KeyValueGridProps extends BaseProps {
    children?: any;
}

export function KeyValueGrid(props: KeyValueGridProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "key-value-grid",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );
}

export function InsetKeyValueGrid(props: KeyValueGridProps): ReactElement {
    return (
        <InsetPanel {...props}>
            <KeyValueGrid {...props}/>
        </InsetPanel>
    );
}