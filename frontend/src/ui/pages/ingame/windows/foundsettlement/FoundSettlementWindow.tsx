import {TileIdentifier} from "../../../../../models/base/tile";
import React from "react";
import {TextField} from "../../../../components/textfield/TextField";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/primary/Button";
import {UseFoundSettlementWindow} from "./useFoundSettlementWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {Text} from "../../../../components/text/Text";
import {Header2} from "../../../../components/header/Header";
import {VBox} from "../../../../components/layout/vbox/VBox";

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
                style={{
                    minHeight: "150px",
                }}
            >
                <VBox fillParent gap_s top stretch padding_xs>

                    <Header2>Found Settlement</Header2>

                    <Spacer size="s"/>

                    <HBox>
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

                    <Spacer size="s"/>

                    <HBox right centerVertical gap_s>
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