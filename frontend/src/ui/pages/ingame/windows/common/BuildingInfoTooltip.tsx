import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import React from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {Building} from "../../../../../models/building";


export function BuildingInfoTooltip(props: { building: Building, children?: any }) {
    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>

                    <VBox padding_m gap_s fillParent>
                        <Header4>{props.building.type.displayString}</Header4>
                        <KeyTextValuePair
                            name={"Active"}
                            value={props.building.active ? "Yes" : "No"}
                        />
                        <KeyTextValuePair
                            name={"Tile"}
                            value={
                                props.building.tile
                                    ? props.building.tile.q + ", " + props.building.tile.r
                                    : "-"
                            }
                        />
                    </VBox>

                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );
}