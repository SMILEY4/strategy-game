import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {UseDevWindow} from "./useDevWindow";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";

export interface DevWindowProps {
    windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

    const data: UseDevWindow.Data = UseDevWindow.useData();

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
                <Header1>Dev / Debug</Header1>

                <Spacer size="s"/>

                <BaseInformation {...data}/>

                <ButtonPrimary blue onClick={data.open.devStats}>More Statistics</ButtonPrimary>

                <Spacer size="s"/>

                <ButtonPrimary blue onClick={data.fullscreen.enter}>Enter Fullscreen</ButtonPrimary>
                <ButtonPrimary blue onClick={data.fullscreen.exit}>Exit Fullscreen</ButtonPrimary>

                <Spacer size="xs"/>

                <ButtonPrimary blue onClick={data.webgl.loose}>Loose WebGL-Context</ButtonPrimary>
                <ButtonPrimary blue onClick={data.webgl.restore}>Restore WebGL-Context</ButtonPrimary>
            </VBox>
        </DecoratedWindow>
    );
}


function BaseInformation(props: UseDevWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyValueGrid>
                <EnrichedText>Camera.Pos</EnrichedText>
                <EnrichedText>
                    <ETNumber typeNone unsigned decPlaces={2}>{props.camera.x}</ETNumber>, <ETNumber typeNone unsigned decPlaces={2}>{props.camera.y}</ETNumber>
                </EnrichedText>

                <EnrichedText>Camera.Zoom</EnrichedText>
                <EnrichedText>
                    <ETNumber typeNone unsigned decPlaces={4}>{props.camera.zoom}</ETNumber>
                </EnrichedText>

            </KeyValueGrid>
        </InsetPanel>
    );
}
