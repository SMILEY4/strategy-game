import React, {ReactElement} from "react";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import "./devWindow.css";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {useFullscreen} from "../../../../components/headless/useFullscreen";
import {AppConfig} from "../../../../../main";

export interface DevWindowProps {
    windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

    const [enterFullscreen, exitFullscreen] = useFullscreen("root");
    const [looseWGLContext, restoreWGLContext] = useWebGlContext();

    return <div>TODO</div>
    // return (
    //     <DecoratedWindow
    //         windowId={props.windowId}
    //         classNameContent="dev-window__content"
    //         withCloseButton
    //     >
    //         <h1>Debug</h1>
    //         <ButtonPrimary onClick={enterFullscreen}>Enter Fullscreen</ButtonPrimary>
    //         <ButtonPrimary onClick={exitFullscreen}>Exit Fullscreen</ButtonPrimary>
    //         <ButtonPrimary onClick={looseWGLContext}>Loose WebGL-Context</ButtonPrimary>
    //         <ButtonPrimary onClick={restoreWGLContext}>Restore WebGL-Context</ButtonPrimary>
    //     </DecoratedWindow>
    // );
}


export function useOpenDevWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: WINDOW_ID,
            className: "dev-window",
            left: 25,
            top: 60,
            width: 350,
            height: 310,
            content: <DevWindow windowId={WINDOW_ID}/>,
        });
    };
}


function useWebGlContext() {
    return [
        () => AppConfig.debugLooseWebglContext(),
        () => AppConfig.debugRestoreWebglContext(),
    ];
}
