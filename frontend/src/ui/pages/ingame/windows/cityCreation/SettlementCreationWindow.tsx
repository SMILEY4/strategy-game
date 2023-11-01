import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import React from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {Header2} from "../../../../components/header/Header";
import {TextField} from "../../../../components/textfield/TextField";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {UseSettlementCreationWindow} from "./useSettlementCreationWindow";


export interface SettlementCreationWindowProps {
    windowId: string;
    tile: TileIdentifier,
    asColony: boolean,
}


export function SettlementCreationWindow(props: SettlementCreationWindowProps) {

    const data: UseSettlementCreationWindow.Data = UseSettlementCreationWindow.useData(props.windowId, props.tile, props.asColony);

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
                    value={data.input.name.value}
                    placeholder={"Settlement Name"}
                    type="text"
                    onChange={data.input.name.set}
                />

                <HBox right centerVertical gap_s>
                    <ButtonPrimary red onClick={data.cancel}>
                        Cancel
                    </ButtonPrimary>

                    <BasicTooltip
                        enabled={data.input.valid}
                        delay={500}
                        content={<ul>{data.input.reasonsInvalid.map(e => (<li>{e}</li>))}</ul>}
                    >
                        <ButtonPrimary green disabled={!data.input.valid} onClick={data.create}>
                            Create
                        </ButtonPrimary>
                    </BasicTooltip>

                </HBox>

            </VBox>
        </DecoratedWindow>
    );
}