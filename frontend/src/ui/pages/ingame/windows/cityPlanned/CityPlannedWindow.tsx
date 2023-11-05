import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseCityPlannedWindow} from "./useCityPlannedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Header1} from "../../../../components/header/Header";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {KeyLinkValuePair, KeyTextValuePair} from "../../../../components/keyvalue/KeyValuePair";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";

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
            <KeyLinkValuePair
                name={"Country"}
                value={props.country.name}
                onClick={props.openWindow.country}
            />
            {
                props.province
                    ? (<KeyLinkValuePair
                        name={"Province"}
                        value={props.province.name}
                        onClick={props.openWindow.province}
                    />)
                    : (<KeyTextValuePair
                        name={"Province"}
                        value={"create new"}
                    />)
            }
            <KeyLinkValuePair
                name={"Province"}
                value={props.province ? props.province.name : "create new"}
                onClick={props.openWindow.province}
            />
            <KeyLinkValuePair
                name={"Tile"}
                value={props.tile.q + ", " + props.tile.r}
                onClick={props.openWindow.tile}
            />
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