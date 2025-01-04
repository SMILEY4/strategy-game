import {useTooltip} from "../headless/useTooltip";
import React, {useState} from "react";
import {FloatingPortal} from "@floating-ui/react";
import {TooltipPanel} from "../panels/tooltip/TooltipPanel";

export namespace Tooltip {

    export interface ContextProps {
        enabled?: boolean;
        delay?: number;
        inline?: boolean,
        empty?: boolean,
        children?: any;
    }

    const DEFAULT_DELAY_MS = 300;

    export function Context(props: ContextProps) {

        const {
            isOpen,
            refTrigger,
            propsTrigger,
            refTooltip,
            propsTooltip,
            styleTooltip,
        } = useTooltip(props.delay === undefined ? DEFAULT_DELAY_MS : props.delay);

        let trigger = null;
        let content = null;
        for (let child of props.children) {
            if (child.type.name === Trigger.name) {
                trigger = child;
            }
            if (child.type.name === Content.name) {
                content = child;
            }
        }

        if (props.enabled === false) {
            return trigger;
        }

        return (
            <>

                {props.inline === true && (
                    <span className="tooltip-trigger" ref={refTrigger} {...propsTrigger}>
                        {trigger}
                    </span>
                )}
                {props.inline !== true && (
                    <div className="tooltip-trigger" ref={refTrigger} {...propsTrigger}>
                        {trigger}
                    </div>
                )}

                {(isOpen) && (
                    <FloatingPortal id="root">
                        <div
                            ref={refTooltip}
                            style={styleTooltip}
                            className={"tooltip-content"}
                            {...propsTooltip}
                        >
                            {props.empty === true && (content)}
                            {props.empty !== true && (<TooltipPanel>{content}</TooltipPanel>)}
                        </div>
                    </FloatingPortal>
                )}
            </>
        );
    }


    export function Trigger(props: { children?: any }) {
        return props.children;
    }


    export function Content(props: { children?: any }) {
        return props.children;
    }

}
