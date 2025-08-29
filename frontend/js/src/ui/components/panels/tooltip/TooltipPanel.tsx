import {ReactElement} from "react";
import {joinClassNames} from "../../window/utils";
import "./tooltipPanel.less";
import {BaseProps} from "../../base/base";

export interface TooltipPanelProps extends BaseProps {
    children?: any;
}

/**
 * Simple panel for tooltips.
 */
export function TooltipPanel(props: TooltipPanelProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "tooltip-panel",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            <div className={"tooltip-panel__inner"}>
                {props.children}
            </div>
        </div>
    );
}