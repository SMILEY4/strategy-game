import {useWindow} from "../../headless/useWindowData";
import {PanelDecorated} from "../../objects/panels/decorated/PanelDecorated";
import {ButtonPrimary} from "../../button/primary/ButtonPrimary";
import React from "react";
import {CgClose} from "react-icons/all";
import {joinClassNames} from "../../utils";
import "./decoratedWindow.css";
import "./../../variables.css";

export interface DecoratedWindowProps {
    windowId: string;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string,
    children?: any;
}

export function DecoratedWindow(props: DecoratedWindowProps) {

    const {
        dragProps,
        resizerProps,
        closeWindow,
    } = useWindow(props.windowId, {minWidth: 100, minHeight: 100});

    function handleClose() {
        props.onClose && props.onClose();
        closeWindow();
    }

    return (
        <PanelDecorated className={joinClassNames(["window-decorated", props.className])}>

            <div {...dragProps} className="window-decorated__drag-area"/>

            <div {...resizerProps} className="window-decorated__resize-area"/>

            {props.closeButton && (
                <ButtonPrimary round className="window-decorated__close" onClick={handleClose}>
                    <CgClose/>
                </ButtonPrimary>
            )}

            <div className="window-decorated__content">
                {props.children}
            </div>

        </PanelDecorated>

    );

}