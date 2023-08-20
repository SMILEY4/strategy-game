import React, {CSSProperties, ReactElement} from "react";
import {useWindow} from "../../headless/useWindowData";
import {DecoratedPanel} from "../../panels/decorated/DecoratedPanel";
import {joinClassNames} from "../../utils";
import {ButtonPrimary} from "../../button/primary/ButtonPrimary";
import {CgClose} from "react-icons/all";
import "./decoratedWindow.less"

export interface DecoratedWindowProps {
    windowId: string;
    withCloseButton?: boolean;
    onClose?: () => void;
    style?: CSSProperties
    noPadding?: boolean,
    className?: string,
    children?: any;
}

export function DecoratedWindow(props: DecoratedWindowProps): ReactElement {

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
        <DecoratedPanel
            red
            noPadding={props.noPadding}
            className={joinClassNames(["decorated-window", props.className])}
            elementRef={refWindow}
            style={props.style}
        >

            <div {...dragProps} className="decorated-window__drag-area"/>

            <div {...resizerProps} className="decorated-window__resize-area"/>

            {props.withCloseButton && (
                <ButtonPrimary red round className="decorated-window__close" onClick={handleClose}>
                    <CgClose/>
                </ButtonPrimary>
            )}


            <div className="decorated-window__content">
                {props.children}
            </div>

        </DecoratedPanel>
    )
}