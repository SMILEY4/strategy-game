import React, {ReactElement} from "react";
import {DefaultDecoratedWindowWithBanner} from "../../../../components/windows/decorated/DecoratedWindow";
import {UseCityPlannedWindow} from "./useCityPlannedWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {Else, If, Then} from "react-if";

export interface CityPlannedWindowProps {
    windowId: string;
    commandId: string;
}


export function CityPlannedWindow(props: CityPlannedWindowProps): ReactElement {

    const data: UseCityPlannedWindow.Data = UseCityPlannedWindow.useData(props.commandId);

    return (
        <DefaultDecoratedWindowWithBanner windowId={props.windowId} title={data.name} subtitle="Planned Settlement">
            <BaseDataSection {...data}/>
            <Spacer size={"m"}/>
            <CancelButton {...data}/>
        </DefaultDecoratedWindowWithBanner>
    );
}


function BaseDataSection(props: UseCityPlannedWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyValueGrid>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.country}>{props.country.name}</ETLink></EnrichedText>

                <If condition={props.province !== null}>
                    <Then>
                        <EnrichedText>Province:</EnrichedText>
                        <EnrichedText><ETLink onClick={props.openWindow.province}>{props.province?.name}</ETLink></EnrichedText>
                    </Then>
                    <Else>
                        <EnrichedText>Province:</EnrichedText>
                        <EnrichedText>create new</EnrichedText>
                    </Else>
                </If>

                <EnrichedText>Tile:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.tile}>{props.tile.q + ", " + props.tile.r}</ETLink></EnrichedText>

            </KeyValueGrid>

        </InsetPanel>
    );
}

function CancelButton(props: UseCityPlannedWindow.Data): ReactElement {
    return (
        <ButtonPrimary blue onClick={props.cancel}>
            Cancel Settlement
        </ButtonPrimary>
    );
}