import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./tooltipPanel.less"

export interface TooltipPanelProps {
    className?: string,
    children?: any
}

export function TooltipPanel(props: TooltipPanelProps): ReactElement {
    return (
        <div className={joinClassNames(["tooltip-panel", props.className])}>
            <div className={"tooltip-panel__inner"}>
                {props.children}
            </div>
        </div>
    );
}