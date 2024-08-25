import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {MapMode} from "../../../../../models/primitives/mapMode";
import {UseMapWindow} from "./useMapWindow";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const data: UseMapWindow.Data = UseMapWindow.useData();

    return (
        <DefaultDecoratedWindowWithHeader windowId={props.windowId} title={"Map"}>
            {MapMode.getValues().map(mapMode => {
                return (
                    <ButtonPrimary
                        key={mapMode.id}
                        blue
                        onClick={() => data.setMapMode(mapMode)}
                        disabled={data.selectedMapMode === mapMode}
                    >
                        {mapMode.displayString}
                    </ButtonPrimary>
                );
            })}
        </DefaultDecoratedWindowWithHeader>
    );
}