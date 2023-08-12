import {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {useOpenWindow} from "../../../../components/headless/useWindowData";
import "./mapWindow.css";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";

const MAP_WINDOW_ID = "menubar-window";

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
            classNameContent="map-window__content"
            withCloseButton
        >
            <h1>Map</h1>
            <ButtonPrimary onClick={setDefault}>Default</ButtonPrimary>
            <ButtonPrimary onClick={setCountries}>Countries</ButtonPrimary>
            <ButtonPrimary onClick={setProvinces}>Provinces</ButtonPrimary>
            <ButtonPrimary onClick={setCities}>Cities</ButtonPrimary>
            <ButtonPrimary onClick={setTerrain}>Terrain</ButtonPrimary>
            <ButtonPrimary onClick={setResources}>Resources</ButtonPrimary>
        </DecoratedWindow>
    );

}


export function useOpenMapWindow() {
    const addWindow = useOpenWindow();
    return () => {
        addWindow({
            id: MAP_WINDOW_ID,
            className: "map-window",
            left: 75,
            top: 60,
            width: 350,
            height: 400,
            content: <MapWindow windowId={MAP_WINDOW_ID}/>,
        });
    };
}

function useSetMapModes() {
    return {
        setDefault: () => console.log("todo: set map mode"),
        setCountries: () => console.log("todo: set map mode"),
        setProvinces: () => console.log("todo: set map mode"),
        setCities: () => console.log("todo: set map mode"),
        setTerrain: () => console.log("todo: set map mode"),
        setResources: () => console.log("todo: set map mode"),
    };
}
