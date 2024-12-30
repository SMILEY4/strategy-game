import React, {CSSProperties, ReactElement} from "react";
import {DecoratedPanel} from "../../panels/decorated/DecoratedPanel";
import {joinClassNames} from "../utils";
import {Button} from "../../button/primary/Button";
import {CgClose} from "react-icons/cg";
import "./decoratedWindow.less";
import {AudioType} from "../../../../common/audioService";
import {useWindowInteractions} from "../windowHooks";

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
        refContent,
        closeWindow
    } = useWindowInteractions(props.windowId);

    function handleClose() {
        props.onClose && props.onClose();
        closeWindow();
    }

    return (
        <DecoratedPanel
            ornament
            className={joinClassNames(["decorated-window", props.className])}
            elementRef={refContent}
            style={{
                minWidth: "min-content",
                minHeight: "200px",
                ...props.style
            }}
        >

            <div className="decorated-window__content">
                {props.children}
            </div>

            <div {...dragProps} className="decorated-window__drag-area"/>

            <div {...resizerProps} className="decorated-window__resize-area"/>

            {props.withCloseButton && (
                <Button warn circle className="decorated-window__close" onClick={handleClose} soundId={AudioType.CLICK_CLOSE.id}>
                    <CgClose/>
                </Button>
            )}


        </DecoratedPanel>
    );
}