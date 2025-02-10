import React, {ReactElement} from "react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {UseDevStatsWindow} from "./useDevStatsWindow";
import {Area, Bar, BarChart, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, YAxis} from "recharts";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";

export interface DevStatsWindowProps {
    windowId: string;
}

export function DevStatsWindow(props: DevStatsWindowProps): ReactElement {

    const data: UseDevStatsWindow.Data = UseDevStatsWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
            <VBox padding_l gap_m fullSize scrollable>
                <Txt.Header1 center>
                    <Txt.String>Dev Statistics</Txt.String>
                </Txt.Header1>
                <Divider line/>
                <MonitoringInformation {...data}/>
                <FPSChart {...data}/>
                <NextTurnDurationChart {...data}/>
            </VBox>
        </DecoratedWindow>
    );
}

function MonitoringInformation(props: UseDevStatsWindow.Data): ReactElement {
    return (
        <InsetPanel dontGrow dontShrink>

            <KeyValueGrid>

                <Txt.Body><Txt.String>FPS:</Txt.String></Txt.Body>
                <Txt.Body>
                    <Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.fps.getAverage()}</Txt.Number>
                </Txt.Body>

                <Txt.Body><Txt.String>Frame Duration:</Txt.String></Txt.Body>
                <Txt.Body>
                    <Txt.Number behaviour="neutral" decimalPlaces={3}>{props.rendering.webGLMonitorData.frameDuration.getAverage()}</Txt.Number>
                    <Txt.String> ms</Txt.String>
                </Txt.Body>

                <Txt.Body><Txt.String>Draw Calls:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countDrawCalls}</Txt.Number></Txt.Body>

                <Txt.Body><Txt.String>GLObjects.Buffers:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countBuffers}</Txt.Number></Txt.Body>

                <Txt.Body><Txt.String>GLObjects.VertexArray:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countVertexArrays}</Txt.Number></Txt.Body>

                <Txt.Body><Txt.String>GLObjects.Textures:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countTextures}</Txt.Number></Txt.Body>

                <Txt.Body><Txt.String>GLObjects.Framebuffers:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countFramebuffers}</Txt.Number></Txt.Body>

                <Txt.Body><Txt.String>GLObjects.Programs:</Txt.String></Txt.Body>
                <Txt.Body><Txt.Number behaviour="neutral">{props.rendering.webGLMonitorData.countPrograms}</Txt.Number></Txt.Body>

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
        <InsetPanel dontGrow dontShrink>
            <Txt.Header5>
                <Txt.String>Performance</Txt.String>
            </Txt.Header5>
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
                    <Area yAxisId="left" type="monotone" dataKey="fps" stroke="#8884d8" fill="#8884d8"
                          animateNewValues={false}
                          animationDuration={0}/>
                    <YAxis yAxisId="right" orientation="right" domain={[0, 20]} unit={"ms"}/>
                    <Line yAxisId="right" type="monotone" dataKey="delta" stroke="#82ca9d" animateNewValues={false}
                          animationDuration={0}/>
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
        <InsetPanel dontGrow dontShrink>
            <Txt.Header5>
                <Txt.String>Next-Turn Durations</Txt.String>
            </Txt.Header5>
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