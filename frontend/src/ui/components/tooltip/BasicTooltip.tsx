import {TooltipPanel} from "../panels/tooltip/TooltipPanel";
import {VBox} from "../layout/vbox/VBox";
import React from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "./TooltipContext";

export function BasicTooltip(props: { enabled?: boolean, delay?: number, content: any, children: any }) {
    if (props.enabled !== false) {
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