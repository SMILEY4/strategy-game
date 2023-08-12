import {useWindow} from "../../headless/useWindowData";
import {PanelDecorated} from "../../objects/panels/decorated/PanelDecorated";
import React from "react";
import {CgClose} from "react-icons/all";
import {joinClassNames} from "../../utils";
import {ButtonOutline} from "../../button/outline/ButtonOutline";
import "./decoratedWindow.css";
import "./../../variables.css";

export interface DecoratedWindowProps {
    windowId: string;
    withCloseButton?: boolean;
    onClose?: () => void;
    className?: string,
    classNameContent?: string,
    children?: any;
}

export function DecoratedWindow(props: DecoratedWindowProps) {

    const {
        dragProps,
        resizerProps,
        refWindow,
        closeWindow,
    } = useWindow(props.windowId, {minWidth: 100, minHeight: 100});

    function handleClose() {
        props.onClose && props.onClose();
        closeWindow();
    }

    return (
        <PanelDecorated className={joinClassNames(["window-decorated", props.className])} elementRef={refWindow}>

            <div {...dragProps} className="window-decorated__drag-area"/>

            <div {...resizerProps} className="window-decorated__resize-area"/>

            {props.withCloseButton && (
                <ButtonOutline round className="window-decorated__close" onClick={handleClose}>
                    <CgClose/>
                </ButtonOutline>
            )}

            <div className={joinClassNames(["window-decorated__content", props.classNameContent])}>
                {props.children}
            </div>

        </PanelDecorated>

    );

}