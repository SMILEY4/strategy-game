import "./testWindow.css";
import {useWindow} from "../headless/useWindowData";

export function TestWindow(props: { windowId: string }) {

    const {
        dragProps,
        resizerProps,
    } = useWindow(props.windowId, {minWidth: 100, minHeight: 100});

    return (
        <div className="test-window">
            <div {...dragProps} className="test-window__drag-area"/>
            <div className="test-window__content">
                Test Window
            </div>
            <div {...resizerProps} className="test-window__resize-area"/>
        </div>
    );

}