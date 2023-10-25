import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {GameStateAccess} from "../../../../../state/access/GameStateAccess";
import {MapMode} from "../../../../../models/mapMode";


export function useOpenMapWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: WINDOW_ID,
            className: "map-window",
            left: 25,
            top: 60,
            bottom: 25,
            width: 360,
            content: <MapWindow windowId={WINDOW_ID}/>,
        });
    };
}

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const [selectedMapMode, setMapMode] = GameStateAccess.useMapMode();

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
                            key={mapMode.id}
                            onClick={() => setMapMode(mapMode)}
                            blue
                            disabled={selectedMapMode === mapMode}
                        >
                            {mapMode.displayString}
                        </ButtonPrimary>
                    );
                })}
            </VBox>
        </DecoratedWindow>
    );
}