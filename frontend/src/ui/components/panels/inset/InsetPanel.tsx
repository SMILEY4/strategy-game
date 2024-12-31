import {joinClassNames} from "../../window/utils";
import "./insetPanel.scoped.less";
import {BaseProps} from "../../base/base";

export interface InsetPanelProps extends BaseProps {
    children?: any;
}

/**
 * Panel that looks "inset" into the parent container.
 */
export function InsetPanel(props: InsetPanelProps) {
    return (
        <div
            className={joinClassNames([
                "inset-panel",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );
}