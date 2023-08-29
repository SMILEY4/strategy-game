import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import {Text} from "../../../../components/text/Text";
import React from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/Tooltip";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";


export function BuildingInfoTooltip(props: { children?: any }) {
    return (
        <TooltipContext>
            <TooltipTrigger>
                {props.children}
            </TooltipTrigger>
            <TooltipContent>
                <TooltipPanel>

                    <VBox padding_m gap_s fillParent>
                        <Header4>My Building</Header4>
                        <Text>Description of My Building</Text>
                    </VBox>

                </TooltipPanel>
            </TooltipContent>
        </TooltipContext>
    );
}