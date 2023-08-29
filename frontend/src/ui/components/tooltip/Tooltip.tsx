import {useTooltip} from "../headless/useTooltip";
import React from "react";
import {FloatingPortal} from "@floating-ui/react";

export interface TooltipContextProps {
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
    } = useTooltip();

    let trigger = null;
    let content = null;
    for (let child in props.children) {
        if (props.children[child].type.name === "TooltipTrigger") {
            trigger = props.children[child];
        }
        if (props.children[child].type.name === "TooltipContent") {
            content = props.children[child];
        }
    }

    return (
        <>
            <div className="tooltip-trigger" ref={refTrigger}{...propsTrigger}>
                {trigger}
            </div>

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