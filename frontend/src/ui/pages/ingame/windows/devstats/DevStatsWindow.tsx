import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {roundToPlaces} from "../../../../../shared/utils";
import {UseDevStatsWindow} from "./useDevStatsWindow";
import {Area, Bar, BarChart, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, YAxis} from "recharts";
import {Text} from "../../../../components/text/Text";

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

                <Spacer size="s"/>

                <FPSChart {...data}/>
                <NextTurnDurationChart {...data}/>

            </VBox>
        </DecoratedWindow>
    );
}

function MonitoringInformation(props: UseDevStatsWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyTextValuePair
                name={"FPS"}
                value={roundToPlaces(props.rendering.webGLMonitorData.fps.getAverage(), 0)}
            />
            <KeyTextValuePair
                name={"FrameDuration"}
                value={roundToPlaces(props.rendering.webGLMonitorData.frameDuration.getAverage(), 0) + " ms"}
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


function FPSChart(props: UseDevStatsWindow.Data): ReactElement {
    const fps = props.rendering.webGLMonitorData.fps.getHistory();
    const delta = props.rendering.webGLMonitorData.frameDuration.getHistory();
    const data = fps.map((fps, index) => ({
        index: index,
        fps: fps,
        delta: delta[index],
    }));

    return (
        <InsetPanel>
            <Text>Performance</Text>
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                    data={data}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >

                    <Legend verticalAlign="top" height={36}/>

                    <YAxis yAxisId="left" orientation="left" domain={[0, 80]} unit={"fps"}/>
                    <ReferenceLine yAxisId="left" y={60} stroke="white" strokeDasharray="3 3"/>
                    <ReferenceLine yAxisId="left" y={30} stroke="white" strokeDasharray="3 3"/>
                    <Area yAxisId="left" type="monotone" dataKey="fps" stroke="#8884d8" fill="#8884d8" animateNewValues={false}
                          animationDuration={0}/>

                    <YAxis yAxisId="right" orientation="right" domain={[0, 20]} unit={"ms"}/>
                    <Line yAxisId="right" type="monotone" dataKey="delta" stroke="#82ca9d" animateNewValues={false} animationDuration={0}/>

                </ComposedChart>
            </ResponsiveContainer>
        </InsetPanel>
    );
}


function NextTurnDurationChart(props: UseDevStatsWindow.Data): ReactElement {


    const durations = props.actions.nextTurn;
    const data = durations.map((value, index) => ({
        index: index,
        ms: value,
    }));

    return (
        <InsetPanel>
            <Text>Next-Turn Durations</Text>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={data}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <YAxis unit={"ms"}/>
                    <Bar dataKey={"ms"} fill="#8884d8"/>
                </BarChart>
            </ResponsiveContainer>
        </InsetPanel>
    );
}