import React, {ReactElement} from "react";
import {DecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header1} from "../../../../components/header/Header";
import {Banner} from "../../../../components/banner/Banner";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Text} from "../../../../components/text/Text";
import {BasicTooltip} from "../../../../components/tooltip/BasicTooltip";
import {UseTileWindow} from "./useTileWindow";
import {KeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {If} from "../../../../components/if/If";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    return (
        <DecoratedWindow
            windowId={props.windowId}
            className={"window-tile"}
            withCloseButton
            noPadding
            style={{
                minWidth: "fit-content",
                minHeight: "250px",
            }}
        >
            <VBox fillParent>
                {data && (
                    <>
                        <TileBanner {...data}/>
                        <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>
                            <BaseInformation {...data}/>
                            <Spacer size="s"/>
                            <PlaceScoutButton {...data}/>
                            <CreateColonyButton {...data}/>
                            <CreateSettlementButton {...data}/>
                        </VBox>
                    </>
                )}
                {!data && (
                    <VBox fillParent center>
                        <Text>No tile selected</Text>
                    </VBox>
                )}
            </VBox>
        </DecoratedWindow>
    );
}

function TileBanner(props: UseTileWindow.Data): ReactElement {
    return (
        <Banner spaceAbove subtitle={"Tile"}>
            <Header1 centered>{props.tile.terrainType?.displayString || "Unknown"}</Header1>
        </Banner>
    );
}

function BaseInformation(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <KeyValueGrid>

                <EnrichedText>Id</EnrichedText>
                <EnrichedText>{props.tile.identifier.id}</EnrichedText>

                <EnrichedText>Position</EnrichedText>
                <EnrichedText>{props.tile.identifier.q + ", " + props.tile.identifier.r}</EnrichedText>

                <EnrichedText>Terrain</EnrichedText>
                <EnrichedText>{props.tile.terrainType?.displayString || "None"}</EnrichedText>

                <EnrichedText>Resource</EnrichedText>
                <EnrichedText>{props.tile.resourceType?.displayString || "None"}</EnrichedText>

                <If condition={props.tile.owner !== null && props.tile.owner.city === null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{props.tile.owner?.country.name}</ETLink>
                    </EnrichedText>
                </If>

                <If condition={props.tile.owner !== null && props.tile.owner.city !== null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{props.tile.owner?.country.name}</ETLink> / <ETLink onClick={props.openWindow.city}>{props.tile.owner?.city?.name}</ETLink>
                    </EnrichedText>
                </If>

            </KeyValueGrid>
        </InsetPanel>
    );
}


function PlaceScoutButton(props: UseTileWindow.Data): ReactElement {
    return (
        <ButtonPrimary blue onClick={props.scout.place}>
            Place Scout
        </ButtonPrimary>
    );
}


function CreateColonyButton(props: UseTileWindow.Data): ReactElement {
    return (
        <BasicTooltip
            enabled={!props.createColony.valid}
            delay={500}
            content={
                <ul>
                    {props.createColony.reasonsInvalid.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            }
        >
            <ButtonPrimary
                blue
                disabled={!props.createColony.valid}
                onClick={props.openWindow.createColony}
            >
                Found Colony
            </ButtonPrimary>
        </BasicTooltip>
    );
}


function CreateSettlementButton(props: UseTileWindow.Data): ReactElement {
    return (
        <BasicTooltip
            enabled={!props.createSettlement.valid}
            delay={500}
            content={
                <ul>
                    {props.createSettlement.reasonsInvalid.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            }
        >
            <ButtonPrimary
                blue
                disabled={!props.createSettlement.valid}
                onClick={props.openWindow.createSettlement}
            >
                Found Settlement
            </ButtonPrimary>
        </BasicTooltip>
    );
}
