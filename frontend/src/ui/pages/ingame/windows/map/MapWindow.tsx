import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {MapMode} from "../../../../../models/mapMode";
import {UseMapWindow} from "./useMapWindow";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const data: UseMapWindow.Data = UseMapWindow.useData();

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            className={"window-map"}
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent gap_s top stretch scrollable stableScrollbar>
                <Header1>Map</Header1>
                <Spacer size="s"/>
                {MapMode.getValues().map(mapMode => {
                    return (
                        <ButtonPrimary
                            blue
                            key={mapMode.id}
                            onClick={() => data.setMapMode(mapMode)}
                            disabled={data.selectedMapMode === mapMode}
                        >
                            {mapMode.displayString}
                        </ButtonPrimary>
                    );
                })}
            </VBox>
        </DecoratedWindow>
    );
}