import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {UseDevStatsWindow} from "./useDevStatsWindow";
import {Area, Bar, BarChart, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, YAxis} from "recharts";
import {Text} from "../../../../components/text/Text";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";

export interface DevStatsWindowProps {
    windowId: string;
}

export function DevStatsWindow(props: DevStatsWindowProps): ReactElement {

    const data: UseDevStatsWindow.Data = UseDevStatsWindow.useData();

    return (
        <DefaultDecoratedWindowWithHeader windowId={props.windowId} title={"Dev Statistics"}>
            <MonitoringInformation {...data}/>
            <Spacer size="s"/>
            <FPSChart {...data}/>
            <NextTurnDurationChart {...data}/>
        </DefaultDecoratedWindowWithHeader>
    );
}

function MonitoringInformation(props: UseDevStatsWindow.Data): ReactElement {
    return (
        <InsetPanel>

            <KeyValueGrid>

                <EnrichedText>FPS:</EnrichedText>
                <EnrichedText><ETNumber unstyled int>{props.rendering.webGLMonitorData.fps.getAverage()}</ETNumber></EnrichedText>

                <EnrichedText>Frame Duration:</EnrichedText>
                <EnrichedText><ETNumber unstyled decPlaces={3}>{props.rendering.webGLMonitorData.frameDuration.getAverage()}</ETNumber> ms</EnrichedText>

                <EnrichedText>Draw Calls:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countDrawCalls}</EnrichedText>

                <EnrichedText>GLObjects.Buffers:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countBuffers}</EnrichedText>

                <EnrichedText>GLObjects.VertexArray:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countVertexArrays}</EnrichedText>

                <EnrichedText>GLObjects.Textures:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countTextures}</EnrichedText>

                <EnrichedText>GLObjects.Framebuffers:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countFramebuffers}</EnrichedText>

                <EnrichedText>GLObjects.Programs:</EnrichedText>
                <EnrichedText>{props.rendering.webGLMonitorData.countPrograms}</EnrichedText>

            </KeyValueGrid>
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