import React, {ReactElement} from "react";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
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
            <VBox fillParent gap_s top stretch padding_xs scrollable stableScrollbar>

                <Header1>Dev / Debug</Header1>

                <Spacer size="s"/>

                <BaseInformation {...data}/>
                <ButtonPrimary info onClick={data.open.devStats}>More Statistics</ButtonPrimary>

                <Spacer size="s"/>

                <ButtonPrimary info onClick={data.fullscreen.enter}>Enter Fullscreen</ButtonPrimary>
                <ButtonPrimary info onClick={data.fullscreen.exit}>Exit Fullscreen</ButtonPrimary>

                <Spacer size="xs"/>

                <ButtonPrimary info onClick={data.webgl.loose}>Loose WebGL-Context</ButtonPrimary>
                <ButtonPrimary info onClick={data.webgl.restore}>Restore WebGL-Context</ButtonPrimary>

            </VBox>
        </DecoratedWindow>
    );
}


function BaseInformation(props: UseDevWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid>
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
