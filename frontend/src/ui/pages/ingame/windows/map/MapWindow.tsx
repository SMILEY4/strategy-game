import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const {
        setDefault,
        setCountries,
        setProvinces,
        setCities,
        setTerrain,
        setResources,
    } = useSetMapModes();

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
            <VBox fillParent gap_s top stretch>
                <Header1>Map</Header1>
                <Spacer size="s"/>
                <ButtonPrimary blue onClick={setDefault}>Default</ButtonPrimary>
                <ButtonPrimary blue onClick={setCountries}>Countries</ButtonPrimary>
                <ButtonPrimary blue onClick={setProvinces}>Provinces</ButtonPrimary>
                <ButtonPrimary blue onClick={setCities}>Cities</ButtonPrimary>
                <ButtonPrimary blue onClick={setTerrain}>Terrain</ButtonPrimary>
                <ButtonPrimary blue onClick={setResources}>Resources</ButtonPrimary>
            </VBox>
        </DecoratedWindow>
    );
}


export function useOpenMapWindow() {
    const WINDOW_ID = "menubar-window";
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: WINDOW_ID,
            className: "map-window",
            left: 75,
            top: 60,
            width: 350,
            height: 400,
            content: <MapWindow windowId={WINDOW_ID}/>,
        });
    };
}

// TODO
function useSetMapModes() {
    return {
        setDefault: () => alert("todo: set map mode"),
        setCountries: () => alert("todo: set map mode"),
        setProvinces: () => alert("todo: set map mode"),
        setCities: () => alert("todo: set map mode"),
        setTerrain: () => alert("todo: set map mode"),
        setResources: () => alert("todo: set map mode"),
    };
}
