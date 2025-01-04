import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Button} from "../../../../components/button/Button";
import {MapMode} from "../../../../../models/base/mapMode";
import {UseMapWindow} from "./useMapWindow";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const data: UseMapWindow.Data = UseMapWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
            <VBox padding_l gap_m fullSize>

                <Header1 centered>Map</Header1>

                <Divider line/>

                <InsetPanel shrink>
                    <VBox scrollable padding_s gap_s fullSize>

                        {MapMode.getValues().map(mapMode => {
                            return (
                                <TooltipContext key={mapMode.id}>
                                    <TooltipTrigger>
                                        <Button
                                            info
                                            onClick={() => data.setMapMode(mapMode)}
                                            disabled={data.selectedMapMode === mapMode}
                                        >
                                            {mapMode.displayString}
                                        </Button>
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
                </InsetPanel>

            </VBox>
        </DecoratedWindow>
    );
}