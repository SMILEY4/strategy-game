import "./buildingBox.less";
import React, {ReactElement} from "react";
import {Building} from "../../../../../models/base/building";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {If, Then} from "react-if";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {Spacer} from "../../../../components/spacer/Spacer";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";
import {DecoratedPanel, DecoratedPanelImageBackground} from "../../../../components/panels/decorated/DecoratedPanel";
import {ETImageIcon} from "../../../../components/textenriched/elements/ETImageIcon";
import {Header4} from "../../../../components/header/Header";
import {Divider} from "../../../../components/divider/Divider";

export function BuildingBox(props: { building: Building }): ReactElement {
    return (
        <TooltipContext>
            <TooltipTrigger>
                <Box building={props.building}/>
            </TooltipTrigger>
            <TooltipContent>
                <Details building={props.building}/>
            </TooltipContent>
        </TooltipContext>
    );
}


function Box(props: { building: Building }): ReactElement {
    const active = (props.building.validity.workTile && props.building.validity.inputResources)
    return (
        <DecoratedPanel
            className={"building-box"}
            simpleBorder
            noPadding
            pattern
            accent="blue"
            background={
                <DecoratedPanelImageBackground
                    url={"icons/production/" + props.building.type + ".png"}
                    desaturated={!active}
                />
            }
        />
    );
}

function Details(props: { building: Building }): ReactElement {
    return (
        <TooltipPanel>
            <VBox padding_s gap_s fillParent>

                <EnrichedText>
                    <Header4 inline>{props.building.type}</Header4>
                </EnrichedText>

                <Divider type="simple"/>

                <If condition={props.building.activity.consumed.length > 0}>
                    <Then>
                        {props.building.activity.consumed.map(entry => (
                            <EnrichedText key={entry.type}>
                                <ETNumber typeAuto signed>{-entry.amount}</ETNumber> <ETImageIcon url={"icons/resources/" + entry.type + ".png"} /> {entry.type}
                            </EnrichedText>
                        ))}
                    </Then>
                </If>

                <If condition={props.building.activity.produced.length > 0}>
                    <Then>
                        {props.building.activity.produced.map(entry => (
                            <EnrichedText key={entry.type}>
                                <ETNumber typeAuto signed>{entry.amount}</ETNumber> <ETImageIcon url={"icons/resources/" + entry.type + ".png"} /> {entry.type}
                            </EnrichedText>
                        ))}
                    </Then>
                </If>


                <If condition={props.building.activity.missing.length > 0 || !props.building.validity.workTile}>
                    <Then>
                        <Spacer size="s"/>
                        <EnrichedText>
                            Missing:
                        </EnrichedText>
                        {!props.building.validity.workTile && (
                            <EnrichedText style={{color: "hsl(0, 87%, 65%)"}}>
                                {"Tile to work on: " + props.building.workTile.requiredTerrain?.id + " " + props.building.workTile.requiredResource?.id}
                            </EnrichedText>
                        )}
                        {props.building.activity.missing.map(entry => (
                            <EnrichedText key={entry.type}>
                                <ETNumber neg unsigned>{entry.amount}</ETNumber> <ETImageIcon url={"icons/resources/" + entry.type + ".png"} /> {entry.type}
                            </EnrichedText>
                        ))}
                    </Then>
                </If>

            </VBox>
        </TooltipPanel>
    );
}