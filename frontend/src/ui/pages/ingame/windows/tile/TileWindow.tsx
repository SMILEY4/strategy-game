import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {UseTileWindow} from "./useTileWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {Else, If, Then, When} from "react-if";
import {
    DefaultDecoratedWindow,
    DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {Tooltip} from "../../../../components/tooltip/Tooltip";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    return (
        <If condition={data === null}>
            <Then>

                <DefaultDecoratedWindow windowId={props.windowId}>
                    <VBox fillParent center>
                        <Text>No tile selected</Text>
                    </VBox>
                </DefaultDecoratedWindow>

            </Then>
            <Else>

                <DefaultDecoratedWindowWithBanner
                    windowId={props.windowId}
                    title={data?.tile.terrainType?.displayString || "Unknown"}
                    subtitle={"Tile"}
                >
                    <BaseDataSection {...data!}/>
                    <Spacer size="s"/>
                    <PlaceScoutButton {...data!}/>
                    <CreateColonyButton {...data!}/>
                    <CreateSettlementButton {...data!}/>
                    <MarkerButton {...data!}/>
                </DefaultDecoratedWindowWithBanner>

            </Else>
        </If>

    );
}


function BaseDataSection(props: UseTileWindow.Data): ReactElement {
    return (
        <WindowSection>
            <InsetKeyValueGrid>

                <EnrichedText>Id</EnrichedText>
                <EnrichedText>{props.tile.identifier.id}</EnrichedText>

                <EnrichedText>Position</EnrichedText>
                <EnrichedText>{props.tile.identifier.q + ", " + props.tile.identifier.r}</EnrichedText>

                <EnrichedText>Terrain</EnrichedText>
                <EnrichedText>{props.tile.terrainType?.displayString || "None"}</EnrichedText>

                <EnrichedText>Resource</EnrichedText>
                <EnrichedText>{props.tile.resourceType?.displayString || "None"}</EnrichedText>

                <When condition={props.tile.owner !== null && props.tile.owner.city === null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{props.tile.owner?.country.name}</ETLink>
                    </EnrichedText>
                </When>

                <When condition={props.tile.owner !== null && props.tile.owner.city !== null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{props.tile.owner?.country.name}</ETLink> / <ETLink
                        onClick={props.openWindow.city}>{props.tile.owner?.city?.name}</ETLink>
                    </EnrichedText>
                </When>

            </InsetKeyValueGrid>
        </WindowSection>
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
        <Tooltip enabled={!props.createColony.valid}>
            <Tooltip.Trigger>
                <ButtonPrimary
                    blue
                    disabled={!props.createColony.valid}
                    onClick={props.openWindow.createColony}
                >
                    Found Colony
                </ButtonPrimary>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <ul>
                    {props.createColony.reasonsInvalid.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            </Tooltip.Content>
        </Tooltip>
    );
}


function CreateSettlementButton(props: UseTileWindow.Data): ReactElement {
    return (
        <Tooltip enabled={!props.createSettlement.valid}>
            <Tooltip.Trigger>
                <ButtonPrimary
                    blue
                    disabled={!props.createSettlement.valid}
                    onClick={props.openWindow.createSettlement}
                >
                    Found Settlement
                </ButtonPrimary>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <ul>
                    {props.createSettlement.reasonsInvalid.map((e, i) => (
                        <li key={i}>{e}</li>
                    ))}
                </ul>
            </Tooltip.Content>
        </Tooltip>
    );
}

function MarkerButton(props: UseTileWindow.Data): ReactElement {
    if (props.marker.canDelete) {
        return (
            <ButtonPrimary
                blue
                onClick={props.marker.delete}
            >
                Delete Marker
            </ButtonPrimary>
        );
    } else {
        return (
            <ButtonPrimary
                blue
                disabled={!props.marker.canPlace}
                onClick={props.openWindow.placeMarker}
            >
                Place Marker
            </ButtonPrimary>
        );
    }
}
