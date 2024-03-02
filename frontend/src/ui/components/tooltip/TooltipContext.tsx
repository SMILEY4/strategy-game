import {useTooltip} from "../headless/useTooltip";
import React from "react";
import {FloatingPortal} from "@floating-ui/react";
import {createRoutesFromChildren} from "react-router-dom";

export interface TooltipContextProps {
    delay?: number;
    inline?: boolean,
    children?: any;
}

export function TooltipContext(props: TooltipContextProps) {

    const {
        isOpen,
        refTrigger,
        propsTrigger,
        refTooltip,
        propsTooltip,
        styleTooltip,
    } = useTooltip(props.delay);

    let trigger = null;
    let content = null;
    for (let child of props.children) {
        if (child.type.name === "TooltipTrigger") {
            trigger = child;
        }
        if (child.type.name === "TooltipContent") {
            content = child;
        }
    }

    return (
        <>

            {props.inline === true && (
                <span className="tooltip-trigger" ref={refTrigger}{...propsTrigger}>
                    {trigger}
                </span>
            )}
            {props.inline !== true && (
                <div className="tooltip-trigger" ref={refTrigger}{...propsTrigger}>
                    {trigger}
                </div>
            )}

            {isOpen && (
                <FloatingPortal id="root">
                    <div
                        ref={refTooltip}
                        style={styleTooltip}
                        className={"tooltip-content"}
                        {...propsTooltip}
                    >
                        {content}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
}


export function TooltipTrigger(props: { children?: any }) {
    return (
        props.children
    );
}


export function TooltipContent(props: { children?: any }) {
    return (
        props.children
    );
}