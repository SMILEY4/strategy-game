import {TooltipContent, TooltipContext, TooltipTrigger} from "./Tooltip";
import {TooltipPanel} from "../panels/tooltip/TooltipPanel";
import {VBox} from "../layout/vbox/VBox";
import React from "react";

export function BasicTooltip(props: { delay: number | undefined, content: any, children: any }) {
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
}