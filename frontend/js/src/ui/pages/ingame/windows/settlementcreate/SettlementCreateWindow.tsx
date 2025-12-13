import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UseSettlementCreateWindow} from "./useSettlementCreateWindow";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {TextField} from "../../../../components/textfield/TextField";
import {Button} from "../../../../components/button/Button";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import React from "react";

export interface SettlementCreateWindowProps {
    windowId: string;
    worldObjectId: WorldObject.Id,
}


export function SettlementCreateWindow(props: SettlementCreateWindowProps) {

    const data: UseSettlementCreateWindow.Data = UseSettlementCreateWindow.useData(props.windowId, props.worldObjectId);

    return (
        <>

            <DecoratedWindow
                windowId={props.windowId}
                style={{minHeight: "150px"}}
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

                        <Tooltip.Context enabled={!data.valid}>
                            <Tooltip.Trigger>
                                <Button success disabled={!data.valid} onClick={data.create}>
                                    Create
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <TooltipPanel>
                                    {data.reasonsInvalid.map(e => (
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