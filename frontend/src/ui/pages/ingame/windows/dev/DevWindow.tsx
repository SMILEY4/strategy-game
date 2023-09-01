import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {useWebGlContext} from "../../../../hooks/game/debug";

export function useOpenDevWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: WINDOW_ID,
            className: "dev-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <DevWindow windowId={WINDOW_ID}/>,
        });
    };
}

export interface DevWindowProps {
    windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

    const [enterFullscreen, exitFullscreen] = useFullscreen("root");
    const [looseWGLContext, restoreWGLContext] = useWebGlContext();

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            style={{
                minWidth: "fit-content",
                minHeight: "150px",
            }}
        >
            <VBox fillParent gap_s top stretch scrollable stableScrollbar>
                <Header1>Debug</Header1>
                <Spacer size="s"/>
                <ButtonPrimary blue onClick={enterFullscreen}>Enter Fullscreen</ButtonPrimary>
                <ButtonPrimary blue onClick={exitFullscreen}>Exit Fullscreen</ButtonPrimary>
                <ButtonPrimary blue onClick={looseWGLContext}>Loose WebGL-Context</ButtonPrimary>
                <ButtonPrimary blue onClick={restoreWGLContext}>Restore WebGL-Context</ButtonPrimary>
            </VBox>
        </DecoratedWindow>
    );
}

