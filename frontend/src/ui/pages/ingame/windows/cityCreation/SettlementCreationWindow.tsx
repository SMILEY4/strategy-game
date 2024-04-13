import {DefaultDecoratedWindowWithHeader} from "../../../../components/windows/decorated/DecoratedWindow";
import React from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {TextField} from "../../../../components/textfield/TextField";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
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
        <>

            <DefaultDecoratedWindowWithHeader
                windowId={props.windowId}
                minHeight="150px"
                withoutScroll
                header={2}
                title={"Found " + (props.asColony ? "Colony" : "Settlement")}
            >

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
                        enabled={!data.input.valid}
                        delay={500}
                        content={<ul>{data.input.reasonsInvalid.map(e => (<li>{e}</li>))}</ul>}
                    >
                        <ButtonPrimary green disabled={!data.input.valid} onClick={data.create}>
                            Create
                        </ButtonPrimary>
                    </BasicTooltip>

                </HBox>

            </DefaultDecoratedWindowWithHeader>
        </>
    );
}