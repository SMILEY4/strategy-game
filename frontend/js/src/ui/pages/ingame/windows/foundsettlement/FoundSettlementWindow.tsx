import React from "react";
import {TextField} from "../../../../components/textfield/TextField";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/Button";
import {UseFoundSettlementWindow} from "./useFoundSettlementWindow";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import { Tooltip } from "../../../../components/tooltip/Tooltip";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";
import {TileSummary} from "../../../../../models/tile/tileSummary";

export interface FoundSettlementWindowProps {
    windowId: string;
    tile: TileSummary,
    worldObjectId: WorldObjectId,
}


export function FoundSettlementWindow(props: FoundSettlementWindowProps) {

    const data: UseFoundSettlementWindow.Data = UseFoundSettlementWindow.useData(props.windowId, props.tile, props.worldObjectId);

    return (
        <>

            <DecoratedWindow
                windowId={props.windowId}
                style={{minHeight: "150px",}}
            >
                <VBox padding_l gap_m fullSize>

                    <Txt.Header2>
                        <Txt.String>Found Settlement</Txt.String>
                    </Txt.Header2>

                    <Divider line/>

                    <HBox gap_none>
                        <TextField
                            value={data.input.name.value}
                            placeholder={"Settlement Name"}
                            type="text"
                            onChange={data.input.name.set}
                        />
                        <Button info onClick={data.randomizeName}>
                            Random
                        </Button>
                    </HBox>

                    <HBox right gap_s>
                        <Button warn onClick={data.cancel}>
                            Cancel
                        </Button>

                        <Tooltip.Context enabled={!data.input.valid}>
                            <Tooltip.Trigger>
                                <Button success disabled={!data.input.valid} onClick={data.create}>
                                    Create
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <TooltipPanel>
                                    {data.input.reasonsInvalid.map(e => (
                                        <Txt.Body><Txt.String>{e}</Txt.String></Txt.Body>
                                    ))}
                                </TooltipPanel>
                            </Tooltip.Content>
                        </Tooltip.Context>
                    </HBox>
                </VBox>
            </DecoratedWindow>
        </>
    );
}