import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import React from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {TextField} from "../../../../components/textfield/TextField";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {UsePlaceMarkerWindow} from "./usePlaceMarker";


export interface PlaceMarkerWindowProps {
    windowId: string;
    tile: TileIdentifier,
}


export function PlaceMarkerWindow(props: PlaceMarkerWindowProps) {

    const data: UsePlaceMarkerWindow.Data = UsePlaceMarkerWindow.useData(props.windowId, props.tile);

    return (
        <DefaultDecoratedWindowWithHeader
            windowId={props.windowId}
            minHeight="150px"
            withoutScroll
            header={2}
            title={"Place Marker"}
        >

            <TextField
                value={data.input.label}
                placeholder={"Marker Label"}
                type="text"
                onChange={data.input.setLabel}
            />

            <HBox right centerVertical gap_s>

                <ButtonPrimary red onClick={data.cancel}>
                    Cancel
                </ButtonPrimary>

                <ButtonPrimary green onClick={data.create}>
                    Create
                </ButtonPrimary>

            </HBox>

        </DefaultDecoratedWindowWithHeader>
    );
}