import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {UseDevWindow} from "./useDevWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";

export interface DevWindowProps {
    windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

    const data: UseDevWindow.Data = UseDevWindow.useData();

    return (
        <DefaultDecoratedWindowWithHeader windowId={props.windowId} title="Dev / Debug">

            <BaseInformation {...data}/>
            <ButtonPrimary blue onClick={data.open.devStats}>More Statistics</ButtonPrimary>

            <Spacer size="s"/>

            <ButtonPrimary blue onClick={data.fullscreen.enter}>Enter Fullscreen</ButtonPrimary>
            <ButtonPrimary blue onClick={data.fullscreen.exit}>Exit Fullscreen</ButtonPrimary>

            <Spacer size="xs"/>

            <ButtonPrimary blue onClick={data.webgl.loose}>Loose WebGL-Context</ButtonPrimary>
            <ButtonPrimary blue onClick={data.webgl.restore}>Restore WebGL-Context</ButtonPrimary>

        </DefaultDecoratedWindowWithHeader>
    );
}


function BaseInformation(props: UseDevWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid>
            <EnrichedText>Camera.Pos</EnrichedText>
            <EnrichedText>
                <ETNumber unstyled decPlaces={2}>{props.camera.x}</ETNumber>, <ETNumber unstyled decPlaces={2}>{props.camera.y}</ETNumber>
            </EnrichedText>

            <EnrichedText>Camera.Zoom</EnrichedText>
            <EnrichedText>
                <ETNumber unstyled decPlaces={4}>{props.camera.zoom}</ETNumber>
            </EnrichedText>

        </InsetKeyValueGrid>
    );
}
