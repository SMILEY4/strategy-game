import React, {ReactElement} from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../tooltip/Tooltip";
import {TooltipPanel} from "../../panels/tooltip/TooltipPanel";
import {VBox} from "../../layout/vbox/VBox";
import "./etElements.scoped.less";

export interface ETTooltipProps {
    content?: string,
    children?: any
}

export function ETTooltip(props: ETTooltipProps): ReactElement {
    return (
        <TooltipContext delay={500} inline>
            <TooltipTrigger>
                <span className={"et-tooltip"}>
                    {props.children}
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>
                    {getContent()}
                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );

    function getContent(): ReactElement {
        if (props.content) {
            return (
                <VBox padding_m gap_s fillParent>
                    {props.content}
                </VBox>
            );
        } else {
            return props.children;
        }
    }

}