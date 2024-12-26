import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {MapMode} from "../../../../../models/base/mapMode";
import {UseMapWindow} from "./useMapWindow";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Header1} from "../../../../components/header/Header";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const data: UseMapWindow.Data = UseMapWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton>
            <VBox fillParent gap_s top stretch padding_xs>
                <Header1>Map</Header1>
                <Spacer size={"s"}/>
                <VBox fillParent gap_s top stretch padding_xs scrollable stableScrollbar>
                    {MapMode.getValues().map(mapMode => {
                        return (
                            <TooltipContext key={mapMode.id}>
                                <TooltipTrigger>
                                    <ButtonPrimary
                                        info
                                        onClick={() => data.setMapMode(mapMode)}
                                        disabled={data.selectedMapMode === mapMode}
                                    >
                                        {mapMode.displayString}
                                    </ButtonPrimary>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <TooltipPanel>
                                        {mapMode.description}
                                    </TooltipPanel>
                                </TooltipContent>
                            </TooltipContext>
                        );
                    })}
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}