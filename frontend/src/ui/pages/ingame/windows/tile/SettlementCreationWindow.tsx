import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import React, {useState} from "react";
import {useCloseWindow, useOpenWindow} from "../../../../components/headless/useWindowData";
import {Tile} from "../../../../../models/tile";
import {Header2} from "../../../../components/header/Header";
import {TextField} from "../../../../components/textfield/TextField";
import {useCreateSettlement} from "../../../../hooks/city";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";


export function useOpenSettlementCreationWindow() {
    const WINDOW_ID = "settlement-creation-window";
    const addWindow = useOpenWindow();
    return (tile: Tile, asColony: boolean) => {
        addWindow({
            id: WINDOW_ID,
            className: "settlement-creation-window",
            left: 125,
            top: 160,
            width: 360,
            height: 170,
            content: <SettlementCreationWindow windowId={WINDOW_ID} tile={tile} asColony={asColony}/>,
        });
    };
}

export interface SettlementCreationWindowProps {
    windowId: string;
    tile: Tile,
    asColony: boolean,
}


export function SettlementCreationWindow(props: SettlementCreationWindowProps) {

    const [name, setName] = useState("");
    const [valid, failedValidations, create] = useCreateSettlement(props.tile, name, props.asColony);
    const closeWindow = useCloseWindow();

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

                <Header2>{"Found " + (props.asColony ? "Colony" : "Settlement")}</Header2>

                <Spacer size="s"/>

                <TextField
                    value={name}
                    placeholder={"Settlement Name"}
                    type="text"
                    onChange={setName}
                />

                <HBox right centerVertical gap_s>
                    <ButtonPrimary red onClick={() => closeWindow(props.windowId)}>
                        Cancel
                    </ButtonPrimary>

                    <BasicTooltip
                        enabled={!valid}
                        delay={500}
                        content={
                            <ul>
                                {failedValidations.map(e => (<li>{e}</li>))}
                            </ul>
                        }
                    >
                        <ButtonPrimary
                            green disabled={!valid}
                            onClick={() => {
                                create();
                                closeWindow(props.windowId);
                            }}
                        >
                            Create
                        </ButtonPrimary>
                    </BasicTooltip>

                </HBox>

            </VBox>
        </DecoratedWindow>
    );
}