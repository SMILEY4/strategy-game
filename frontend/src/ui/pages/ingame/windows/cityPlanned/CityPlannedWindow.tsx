import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseCityPlannedWindow} from "./useCityPlannedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Header1} from "../../../../components/header/Header";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {If} from "../../../../components/if/If";

export interface CityPlannedWindowProps {
    windowId: string;
    commandId: string;
}


export function CityPlannedWindow(props: CityPlannedWindowProps): ReactElement {

    const data: UseCityPlannedWindow.Data = UseCityPlannedWindow.useData(props.commandId);

    return (
        <DecoratedWindow
            windowId={props.windowId}
            withCloseButton
            noPadding
            style={{
                minWidth: "fit-content",
                minHeight: "300px",
            }}
        >
            <VBox fillParent>
                <CityPlannedBanner {...data}/>
                <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                    <BaseDataSection {...data}/>
                    <Spacer size={"m"}/>
                    <CancelButton {...data}/>
                </VBox>
            </VBox>
        </DecoratedWindow>
    );
}


function CityPlannedBanner(props: UseCityPlannedWindow.Data): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Planned Settlement"}>
            <Header1 centered>{props.name}</Header1>
        </Banner>
    );
}

function BaseDataSection(props: UseCityPlannedWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyValueGrid>

                <EnrichedText>Country:</EnrichedText>
                <EnrichedText><ETLink onClick={props.openWindow.country}>{props.country.name}</ETLink></EnrichedText>

                <If condition={props.province !== null}>
                    <EnrichedText>Province:</EnrichedText>
                    <EnrichedText><ETLink onClick={props.openWindow.province}>{props.province?.name}</ETLink></EnrichedText>
                </If>

                <If condition={props.province === null}>
                    <EnrichedText>Province:</EnrichedText>
                    <EnrichedText>create new</EnrichedText>
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