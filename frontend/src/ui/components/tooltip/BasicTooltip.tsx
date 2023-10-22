import {TooltipContent, TooltipContext, TooltipTrigger} from "./Tooltip";
import {TooltipPanel} from "../panels/tooltip/TooltipPanel";
import {VBox} from "../layout/vbox/VBox";
import React from "react";

export function BasicTooltip(props: { enabled?: boolean, delay?: number, content: any, children: any }) {
    if (props.enabled) {
        return (
            <TooltipContext delay={props.delay}>
                <TooltipTrigger>
                    {props.children}
                </TooltipTrigger>
                <TooltipContent>
                    <TooltipPanel>
                        <VBox padding_m gap_s fillParent>
                            {props.content}
                        </VBox>
                    </TooltipPanel>
                </TooltipContent>
            </TooltipContext>
        );
    } else {
        return props.children;
    }

}