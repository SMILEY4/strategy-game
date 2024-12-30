import {TileIdentifier} from "../../../../../models/base/tile";
import React from "react";
import {TextField} from "../../../../components/textfield/TextField";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/primary/Button";
import {UseFoundSettlementWindow} from "./useFoundSettlementWindow";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {Text} from "../../../../components/text/Text";
import {Header2} from "../../../../components/header/Header";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";

export interface FoundSettlementWindowProps {
    windowId: string;
    tile: TileIdentifier,
    worldObjectId: string
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

                    <Header2>Found Settlement</Header2>

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

                        <TooltipContext enabled={!data.input.valid}>
                            <TooltipTrigger>
                                <Button success disabled={!data.input.valid} onClick={data.create}>
                                    Create
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <TooltipPanel>
                                    {data.input.reasonsInvalid.map(e => (
                                        <Text type="negative">{e}</Text>
                                    ))}
                                </TooltipPanel>
                            </TooltipContent>
                        </TooltipContext>
                    </HBox>
                </VBox>
            </DecoratedWindow>
        </>
    );
}