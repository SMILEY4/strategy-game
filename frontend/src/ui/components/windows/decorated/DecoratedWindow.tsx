import React, {CSSProperties, ReactElement} from "react";
import {useWindow} from "../../headless/useWindowData";
import {DecoratedPanel} from "../../panels/decorated/DecoratedPanel";
import {joinClassNames} from "../../utils";
import {ButtonPrimary} from "../../button/primary/ButtonPrimary";
import {CgClose} from "react-icons/cg";
import "./decoratedWindow.less";
import {AudioType} from "../../../../logic/audio/audioService";
import {VBox} from "../../layout/vbox/VBox";
import {HeaderBanner} from "../../banner/Banner";
import {Header, Header1} from "../../header/Header";
import {Spacer} from "../../spacer/Spacer";

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
    } = useWindow(props.windowId);

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
                <ButtonPrimary red round className="decorated-window__close" onClick={handleClose} soundId={AudioType.CLICK_CLOSE.id}>
                    <CgClose/>
                </ButtonPrimary>
            )}

            <div className="decorated-window__content">
                {props.children}
            </div>

        </DecoratedPanel>
    );
}


export function DefaultDecoratedWindow(props: {
    windowId: string,
    minHeight?: string,
    children?: any,
    withPadding?: boolean
}): ReactElement {
    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            noPadding={props.withPadding !== true}
            style={{
                minWidth: "fit-content",
                minHeight: props.minHeight ? props.minHeight : "300px",
            }}
        >
            <VBox fillParent gap_s top stretch>
                {props.children}
            </VBox>
        </DecoratedWindow>
    );
}

export function DefaultDecoratedWindowWithHeader(props: {
    windowId: string,
    minHeight?: string,
    title: string,
    header?: 1 | 2 | 3 | 4,
    withoutScroll?: boolean,
    children?: any,
}): ReactElement {
    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            style={{
                minWidth: "fit-content",
                minHeight: props.minHeight ? props.minHeight : "300px",
            }}
        >
            <VBox fillParent gap_s top stretch scrollable={props.withoutScroll !== true} stableScrollbar={props.withoutScroll !== true}>
                <Header level={props.header || 1}>{props.title}</Header>
                <Spacer size="s"/>
                {props.children}
            </VBox>
        </DecoratedWindow>
    );
}


export function DefaultDecoratedWindowWithBanner(props: {
    windowId: string,
    minHeight?: string,
    title: string,
    subtitle?: string,
    children?: any
}): ReactElement {
    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            noPadding
            style={{
                minWidth: "fit-content",
                minHeight: props.minHeight ? props.minHeight : "300px",
            }}
        >
            <VBox fillParent>
                <HeaderBanner title={props.title} subtitle={props.subtitle}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    {props.children}
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}