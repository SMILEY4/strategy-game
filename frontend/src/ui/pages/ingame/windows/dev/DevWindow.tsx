import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {roundToPlaces} from "../../../../../shared/utils";
import {UseDevWindow} from "./useDevWindow";

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
            <KeyTextValuePair
                name={"Camera.Pos"}
                value={roundToPlaces(props.camera.x, 4) + ", " + roundToPlaces(props.camera.y, 4)}
            />
            <KeyTextValuePair
                name={"Camera.Zoom"}
                value={roundToPlaces(props.camera.zoom, 4)}
            />
        </InsetPanel>
    );
}
