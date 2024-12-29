import React, {ReactElement} from "react";
import {Button} from "../../../../components/button/primary/Button";
import {Spacer, VSpacer} from "../../../../components/spacer/Spacer";
import {UseDevWindow} from "./useDevWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";

export interface DevWindowProps {
    windowId: string;
}

export function DevWindow(props: DevWindowProps): ReactElement {

    const data: UseDevWindow.Data = UseDevWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox fullSize gap_s padding_l scrollable>

                <Header1>Dev / Debug</Header1>

                <VSpacer size_s/>

                <BaseInformation {...data}/>
                <Button onClick={data.open.devStats}>More Statistics</Button>

                <VSpacer size_s/>

                <Button onClick={data.fullscreen.enter}>Enter Fullscreen</Button>
                <Button onClick={data.fullscreen.exit}>Exit Fullscreen</Button>

                <VSpacer size_s/>

                <Button onClick={data.webgl.loose}>Loose WebGL-Context</Button>
                <Button onClick={data.webgl.restore}>Restore WebGL-Context</Button>

            </VBox>
        </DecoratedWindow>
    );
}


function BaseInformation(props: UseDevWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid dontShrink dontGrow>

            <EnrichedText>Camera.Pos</EnrichedText>
            <EnrichedText>
                <ETNumber unstyled decPlaces={2}>{props.camera.x}</ETNumber>, <ETNumber unstyled
                                                                                        decPlaces={2}>{props.camera.y}</ETNumber>
            </EnrichedText>

            <EnrichedText>Camera.Zoom</EnrichedText>
            <EnrichedText>
                <ETNumber unstyled decPlaces={4}>{props.camera.zoom}</ETNumber>
            </EnrichedText>

        </InsetKeyValueGrid>
    );
}
