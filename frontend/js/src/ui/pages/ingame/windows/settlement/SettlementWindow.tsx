import React, {ReactElement} from "react";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {UseSettlementWindow} from "./useSettlementWindow";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Txt} from "../../../../components/text/Txt";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Banner} from "../../../../components/banner/Banner";
import {Button} from "../../../../components/button/Button";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {arrayOfSize} from "../../../../../common/utils";
import "./settlementWindow.css";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";

export interface SettlementWindowProps {
    windowId: string;
    identifier: WorldObject.Id | null;
}

export function SettlementWindow(props: SettlementWindowProps): ReactElement {

    const data = UseSettlementWindow.useData(props.identifier);
    console.log(data);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
                <Txt.Body center fullSize>
                    <Txt.String>No settlement selected</Txt.String>
                </Txt.Body>
            </DecoratedWindow>
        );
    } else {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
                <VBox fullSize>

                    <Banner
                        title={data.worldObject.type.name}
                        subtitle={"Settlement"}
                        color={data.worldObject.realm.color}
                        spaceAbove
                    >
                        <Button circle small onClick={data.open.tile}><Txt.Icon.Tile/></Button>
                        <Button circle small onClick={data.centerCamera}><Txt.Icon.Eye/></Button>
                    </Banner>

                    <VBox gap_s dontGrow dontShrink padding_m>

                        <VSpacer size_s/>
                        <Txt.Header2 center>
                            <Txt.String>Districts</Txt.String>
                        </Txt.Header2>
                        <Divider line/>

                        <HBox wrap>
                            {data.districts.districts.map(it => (
                                <DistrictSlotFilled key={it.id} tileImprovement={it}/>
                            ))}
                            {arrayOfSize(data.districts.max - data.districts.used).map(it => (
                                <DistrictSlotEmpty key={it}/>
                            ))}
                        </HBox>

                    </VBox>

                </VBox>
            </DecoratedWindow>
        );
    }

}

function DistrictSlotEmpty() {
    return (
        <InsetPanel className="district-slot--empty"></InsetPanel>
    );
}

function DistrictSlotFilled(props: { tileImprovement: WorldObject }) {
    return (
        <Tooltip.Context>
            <Tooltip.Trigger>
                <DecoratedPanel simple blue pattern className="district-slot--filled"></DecoratedPanel>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <Txt.Body><Txt.String>{props.tileImprovement.type.name}</Txt.String></Txt.Body>
            </Tooltip.Content>
        </Tooltip.Context>
    );
}