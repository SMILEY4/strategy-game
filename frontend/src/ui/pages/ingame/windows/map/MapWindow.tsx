import React, {ReactElement} from "react";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import "./mapWindow.css";

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

    return <div>TODO</div>;
    // return (
    //     <DecoratedWindow
    //         windowId={props.windowId}
    //         classNameContent="map-window__content"
    //         withCloseButton
    //     >
    //         <h1>Map</h1>
    //         <ButtonPrimary onClick={setDefault}>Default</ButtonPrimary>
    //         <ButtonPrimary onClick={setCountries}>Countries</ButtonPrimary>
    //         <ButtonPrimary onClick={setProvinces}>Provinces</ButtonPrimary>
    //         <ButtonPrimary onClick={setCities}>Cities</ButtonPrimary>
    //         <ButtonPrimary onClick={setTerrain}>Terrain</ButtonPrimary>
    //         <ButtonPrimary onClick={setResources}>Resources</ButtonPrimary>
    //     </DecoratedWindow>
    // );

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
