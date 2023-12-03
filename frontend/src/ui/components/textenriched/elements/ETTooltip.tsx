import React, {ReactElement} from "react";
import "./etElements.scoped.less";
import {Tooltip} from "../../tooltip/Tooltip";

export interface ETTooltipProps {
    content?: any,
    children?: any
}

export function ETTooltip(props: ETTooltipProps): ReactElement {

    let content = props.content ? props.content : getContent(props.children);
    let trigger = getTrigger(props.children);

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <span className={"et-tooltip"}>
                    {trigger}
                </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
                {content}
            </Tooltip.Content>
        </Tooltip>
    );

    function getContent(children: any) {
        let element = null;
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === Tooltip.Content) {
                element = child;
            }
        });
        return element;
    }

    function getTrigger(children: any) {
        let element = null;
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === Tooltip.Trigger) {
                element = child;
            }
        });
        return element;
    }

}
