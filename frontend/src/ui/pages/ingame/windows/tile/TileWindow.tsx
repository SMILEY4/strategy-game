import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {UseTileWindow} from "./useTileWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {When} from "react-if";
import {
    DefaultDecoratedWindow,
    DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {Spacer} from "../../../../components/spacer/Spacer";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {getHiddenOrDefault, getHiddenOrNull} from "../../../../../models/hiddenType";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {ProportionBar, ProportionBarEntry} from "../../../../components/proportionbar/ProportionBar";
import {Color} from "../../../../../models/color";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DefaultDecoratedWindow windowId={props.windowId}>
                <VBox fillParent center>
                    <Text>No tile selected</Text>
                </VBox>
            </DefaultDecoratedWindow>
        );
    } else {
        return (
            <DefaultDecoratedWindowWithBanner
                windowId={props.windowId}
                title={getHiddenOrNull(data.tile.basic.terrainType)?.displayString || "Unknown"}
                subtitle={"Tile"}
            >
                <BaseDataSection {...data}/>
                <Spacer size="s"/>
                <InfluenceSection {...data}/>
                <Spacer size="s"/>
                <PlaceScoutButton {...data}/>
                <CreateColonyButton {...data}/>
                <CreateSettlementButton {...data}/>
                <MarkerButton {...data}/>
            </DefaultDecoratedWindowWithBanner>
        );
    }

}


function BaseDataSection(props: UseTileWindow.Data): ReactElement {
    const owner = getHiddenOrNull(props.tile.political.owner);
    return (
        <WindowSection>
            <InsetKeyValueGrid>

                <EnrichedText>Id</EnrichedText>
                <EnrichedText>{props.tile.identifier.id}</EnrichedText>

                <EnrichedText>Position</EnrichedText>
                <EnrichedText>{props.tile.identifier.q + ", " + props.tile.identifier.r}</EnrichedText>

                <EnrichedText>Terrain</EnrichedText>
                <EnrichedText>{getHiddenOrNull(props.tile.basic.terrainType)?.displayString ?? "?"}</EnrichedText>

                <EnrichedText>Resource</EnrichedText>
                <EnrichedText>{getHiddenOrNull(props.tile.basic.resourceType)?.displayString ?? "?"}</EnrichedText>

                <When condition={!props.tile.political.owner.visible}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>?</EnrichedText>
                </When>

                <When condition={owner !== null && owner.city === null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{owner?.country.name}</ETLink>
                    </EnrichedText>
                </When>

                <When condition={owner !== null && owner.city !== null}>
                    <EnrichedText>Owned By:</EnrichedText>
                    <EnrichedText>
                        <ETLink onClick={props.openWindow.country}>{owner?.country.name}</ETLink> / <ETLink
                        onClick={props.openWindow.city}>{owner?.city?.name}</ETLink>
                    </EnrichedText>
                </When>

            </InsetKeyValueGrid>
        </WindowSection>
    );
}


function InfluenceSection(props: UseTileWindow.Data): ReactElement {
    const emptyTooltip = props.tile.political.influences.visible ? "No influences" : "Unknown";
    let totalValue = 0;
    const entries: ProportionBarEntry[] = [];

    getHiddenOrDefault(props.tile.political.influences, []).forEach(influence => {
        const amount = Math.round(influence.amount * 100) / 100
        totalValue += amount
        entries.push({
            value: amount,
            name: influence.country.name,
            color: Color.toCss(influence.country.color),
        });
    });

    return (
        <WindowSection title="Influences">
            <InsetPanel>

                <ProportionBar
                    entries={entries}
                    totalValue={totalValue}
                    emptyTooltip={emptyTooltip}
                />
            </InsetPanel>
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
