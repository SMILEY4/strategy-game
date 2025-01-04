import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Button} from "../../../../components/button/Button";
import {MapMode} from "../../../../../models/base/mapMode";
import {UseMapWindow} from "./useMapWindow";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import { Tooltip } from "../../../../components/tooltip/Tooltip";

export interface MapWindowProps {
    windowId: string;
}

export function MapWindow(props: MapWindowProps): ReactElement {

    const data: UseMapWindow.Data = UseMapWindow.useData();

    return (
        <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
            <VBox padding_l gap_m fullSize>

                <Txt.Header1 center>
                    <Txt.String>Map</Txt.String>
                </Txt.Header1>

                <Divider line/>

                <InsetPanel shrink>
                    <VBox scrollable padding_s gap_s fullSize>

                        {MapMode.getValues().map(mapMode => {
                            return (
                                <Tooltip.Context key={mapMode.id}>
                                    <Tooltip.Trigger>
                                        <Button
                                            info
                                            onClick={() => data.setMapMode(mapMode)}
                                            disabled={data.selectedMapMode === mapMode}
                                        >
                                            {mapMode.displayString}
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                        <TooltipPanel>
                                            {mapMode.description}
                                        </TooltipPanel>
                                    </Tooltip.Content>
                                </Tooltip.Context>
                            );
                        })}

                    </VBox>
                </InsetPanel>

            </VBox>
        </DecoratedWindow>
    );
}