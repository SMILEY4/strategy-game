import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import React, {useState} from "react";
import {useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile} from "../../../../../models/tile";
import {Header1, Header2} from "../../../../components/header/Header";
import {TextField} from "../../../../components/textfield/TextField";
import {useCreateSettlement} from "../../../../hooks/game/city";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";


export function useOpenSettlementCreationWindow() {
    const WINDOW_ID = "settlement-creation-window";
    const addWindow = useOpenWindow();
    return (tile: Tile) => {
        addWindow({
            id: WINDOW_ID,
            className: "settlement-creation-window",
            left: 125,
            top: 160,
            width: 360,
            height: 150,
            content: <SettlementCreationWindow windowId={WINDOW_ID} tile={tile}/>,
        });
    };
}

export interface SettlementCreationWindowProps {
    windowId: string;
    tile: Tile
}


export function SettlementCreationWindow(props: SettlementCreationWindowProps) {

    const [name, setName] = useState("")
    const [valid, create] = useCreateSettlement(props.tile, name, false)
    const closeWindow = useCloseWindow()

    return (
        <DecoratedWindow
            windowId={props.windowId}
            className={"window-tile"}
            withCloseButton
            style={{
                minWidth: "fit-content",
                minHeight: "150px",
            }}
        >
            <VBox fillParent gap_s top stretch>

                <Header2>Found Settlement</Header2>

                <Spacer size="s"/>

                <TextField
                    value={name}
                    placeholder={"Settlement Name"}
                    type="text"
                    onChange={setName}
                />

                <HBox right centerVertical gap_s>
                    <ButtonPrimary red onClick={() => closeWindow(props.windowId)}>Cancel</ButtonPrimary>
                    <ButtonPrimary green disabled={!valid} onClick={() => create()}>Create</ButtonPrimary>
                </HBox>

            </VBox>
        </DecoratedWindow>
    );
}