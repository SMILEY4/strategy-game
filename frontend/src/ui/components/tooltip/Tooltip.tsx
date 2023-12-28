import React, {ReactElement} from "react";
import {TooltipPanel} from "../panels/tooltip/TooltipPanel";
import {TooltipContent, TooltipContext, TooltipTrigger} from "./TooltipContext";
import {VBox} from "../layout/vbox/VBox";

export interface TooltipProps {
    enabled?: boolean,
    children?: any;
}

export function Tooltip(props: TooltipProps): ReactElement | null {

    let content = getContent(props.children);
    let target = getTarget(props.children);

    if (props.enabled !== false) {
        return (
            <TooltipContext>
                <TooltipTrigger>
                    {target}
                </TooltipTrigger>
                <TooltipContent>
                    <TooltipPanel>
                        <VBox padding_m gap_xs fillParent>
                            {content}
                        </VBox>
                    </TooltipPanel>
                </TooltipContent>
            </TooltipContext>
        );
    } else {
        return target;
    }


    function getContent(children: any) {
        let element = null;
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === Tooltip.Content) {
                element = child;
            }
        });
        return element;
    }

    function getTarget(children: any) {
        let element = null;
        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === Tooltip.Trigger) {
                element = child;
            }
        });
        return element;
    }

}

export namespace Tooltip {


    export function Content(props: { children?: any }): ReactElement {
        return props.children;
    }


    export function Trigger(props: { children?: any }): ReactElement {
        return props.children;
    }

}

