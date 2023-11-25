import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {roundToPlaces} from "../../../../../shared/utils";
import {UseDevStatsWindow} from "./useDevStatsWindow";

export interface DevStatsWindowProps {
    windowId: string;
}

export function DevStatsWindow(props: DevStatsWindowProps): ReactElement {

    const data: UseDevStatsWindow.Data = UseDevStatsWindow.useData();

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
                <Header1>Dev Statistics</Header1>

                <Spacer size="s"/>

                <MonitoringInformation {...data}/>

            </VBox>
        </DecoratedWindow>
    );
}

function MonitoringInformation(props: UseDevStatsWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"FPS"}
                value={roundToPlaces(props.rendering.webGLMonitorData.fps, 2)}
            />
            <KeyTextValuePair
                name={"FrameDuration"}
                value={props.rendering.webGLMonitorData.frameDuration + " ms"}
            />
            <KeyTextValuePair
                name={"DrawCalls/Frame"}
                value={props.rendering.webGLMonitorData.countDrawCalls}
            />
            <KeyTextValuePair
                name={"GLObjects.Buffers"}
                value={props.rendering.webGLMonitorData.countBuffers}
            />
            <KeyTextValuePair
                name={"GLObjects.VertexArray"}
                value={props.rendering.webGLMonitorData.countVertexArrays}
            />
            <KeyTextValuePair
                name={"GLObjects.Textures"}
                value={props.rendering.webGLMonitorData.countTextures}
            />
            <KeyTextValuePair
                name={"GLObjects.Framebuffers"}
                value={props.rendering.webGLMonitorData.countFramebuffers}
            />
            <KeyTextValuePair
                name={"GLObjects.Programs"}
                value={props.rendering.webGLMonitorData.countPrograms}
            />
        </InsetPanel>
    );
}
