import "./buildingBox.less";
import React, {ReactElement} from "react";
import {joinClassNames} from "../../../../components/utils";
import {Building} from "../../../../../models/base/building";
import {TooltipPanel} from "../../../../components/panels/tooltip/TooltipPanel";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {If, Then} from "react-if";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Header4} from "../../../../components/header/Header";
import {ETNumber} from "../../../../components/textenriched/elements/ETNumber";
import {TooltipContent, TooltipContext, TooltipTrigger} from "../../../../components/tooltip/TooltipContext";

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
    return (
        <div
            className={joinClassNames([
                "building-box",
                (props.building.validity.workTile && props.building.validity.inputResources) ? null : "building-box--disabled",
            ])}
            style={{
                backgroundImage: "url('" + "icons/production/" + props.building.type + ".png')",
            }}
        />
    );
}

function Details(props: { building: Building }): ReactElement {
    return (
        <TooltipPanel>
            <VBox padding_m gap_s fillParent>

                <Header4>{props.building.type}</Header4>

                <If condition={props.building.activity.consumed.length > 0}>
                    <Then>
                        {props.building.activity.consumed.map(entry => (
                            <EnrichedText key={entry.type}>
                                <ETNumber typeAuto signed>{-entry.amount}</ETNumber> {entry.type}
                            </EnrichedText>
                        ))}
                    </Then>
                </If>

                <If condition={props.building.activity.produced.length > 0}>
                    <Then>
                        {props.building.activity.produced.map(entry => (
                            <EnrichedText key={entry.type}>
                                <ETNumber typeAuto signed>{entry.amount}</ETNumber> {entry.type}
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
                                <ETNumber neg unsigned>{entry.amount}</ETNumber> {entry.type}
                            </EnrichedText>
                        ))}
                    </Then>
                </If>

            </VBox>
        </TooltipPanel>
    );
}