import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";


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

    const setDefault = useMapModeDefault();
    const setCountries = useMapModeCountries();
    const setProvinces = useMapModeProvinces();
    const setCities = useMapModeCities();
    const setTerrain = useMapModeTerrain();
    const setResources = useMapModeResources();

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

export function useMapModeDefault() {
    return () => undefined // todo
}

export function useMapModeCountries() {
    return () => undefined // todo
}

export function useMapModeProvinces() {
    return () => undefined // todo
}

export function useMapModeCities() {
    return () => undefined // todo
}

export function useMapModeTerrain() {
    return () => undefined // todo
}

export function useMapModeResources() {
    return () => undefined // todo
}