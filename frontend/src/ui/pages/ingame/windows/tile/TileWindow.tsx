import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/base/tile";
import {UseTileWindow} from "./useTileWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETImageIcon} from "../../../../components/textenriched/elements/ETImageIcon";
import {Case, Else, If, Switch, Then} from "react-if";
import {TileResourceType} from "../../../../../models/base/TileResourceType";
import {Spacer} from "../../../../components/spacer/Spacer";
import {Header2, Header3} from "../../../../components/header/Header";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel, DecoratedPanelColorBackground} from "../../../../components/panels/decorated/DecoratedPanel";
import {Color} from "../../../../../models/base/color";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Banner} from "../../../../components/banner/Banner";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox fillParent center>
                    <Text>No tile selected.</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {


        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>

                <Banner
                    title={mapHiddenOrDefault(data.tile.base, "Undiscovered", base => base.terrainType.id)}
                    subtitle={"Tile"}
                    spaceAbove
                />

                <TabBar initial="Overview">

                    <TabOption name="Overview">
                        <VBox scrollable gap_s stableScrollbar top stretch>
                            <PanelTerrain {...data}/>
                        </VBox>
                    </TabOption>

                    <TabOption name="Political">
                        <VBox scrollable gap_s stableScrollbar top stretch>
                            <PanelPolitical {...data}/>
                        </VBox>
                    </TabOption>

                    <TabOption name="D" circle>
                        <VBox scrollable gap_s stableScrollbar top stretch>
                            <PanelDebug {...data}/>
                        </VBox>
                    </TabOption>

                </TabBar>

            </DecoratedWindow>
        );
    }

}


function PanelTerrain(props: UseTileWindow.Data): ReactElement {
    return (
        <>
            <SectionBaseInformation {...props}/>
            <Spacer size="s"/>
            <SectionContent {...props}/>
        </>
    );
}

function PanelPolitical(props: UseTileWindow.Data): ReactElement {
    return (
        <SectionControlledBy {...props}/>
    );
}

function PanelDebug(props: UseTileWindow.Data): ReactElement {
    return (
        <>
            <InsetKeyValueGrid>

                <EnrichedText>Id:</EnrichedText>
                <EnrichedText>{props.tile.identifier.id}</EnrichedText>

                <EnrichedText>Location:</EnrichedText>
                <EnrichedText>{props.tile.identifier.q + "," + props.tile.identifier.r}</EnrichedText>

            </InsetKeyValueGrid>
        </>
    );
}

function SectionBaseInformation(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetKeyValueGrid>

            <EnrichedText>Terrain:</EnrichedText>
            <EnrichedText>{props.tile.base.value.terrainType.id}</EnrichedText>

            <EnrichedText>Resource:</EnrichedText>
            <If condition={props.tile.base.value.resourceType === TileResourceType.NONE}>
                <Then>
                    <EnrichedText>{props.tile.base.value.resourceType.id}</EnrichedText>
                </Then>
                <Else>
                    <EnrichedText><ETImageIcon
                        url={props.tile.base.value.resourceType.getIconPath()}/> {props.tile.base.value.resourceType.id}
                    </EnrichedText>
                </Else>
            </If>

            <EnrichedText>Location:</EnrichedText>
            <EnrichedText>{props.tile.identifier.q + "," + props.tile.identifier.r}</EnrichedText>

        </InsetKeyValueGrid>
    );
}


function SectionContent(props: UseTileWindow.Data): ReactElement {
    return (
        <VBox top stretch gap_xs>
            <Header2 centered>Content</Header2>
            <Divider/>
            <InsetPanel>
                {props.tile.objects.length === 0 && (
                    <Text type="secondary">Nothing on this tile.</Text>
                )}
                {props.tile.objects.map(tileObject => (
                    <VBox padding_xs gap_xs key={tileObject.settlement?.id + "/" + tileObject.worldObject?.id}>
                        <DecoratedPanel
                            simpleBorder
                            paddingSmall
                            accent="blue"
                            background={<DecoratedPanelColorBackground color={Color.toCss(tileObject.country.color)}/>}
                        >
                            <Switch>
                                <Case condition={tileObject.settlement != null}>
                                    <HBox spaceBetween centerVertical fillParentWidth>
                                        <EnrichedText><ETLink
                                            onClick={() => props.open.tileObject(tileObject)}>{tileObject.settlement?.name}</ETLink></EnrichedText>
                                        <Text type="secondary">Settlement</Text>
                                    </HBox>
                                </Case>
                                <Case condition={tileObject.worldObject != null}>
                                    <HBox spaceBetween centerVertical fillParentWidth>
                                        <EnrichedText><ETLink
                                            onClick={() => props.open.tileObject(tileObject)}>{tileObject.worldObject?.type.id}</ETLink></EnrichedText>
                                        <Text type="secondary">Unit</Text>
                                    </HBox>
                                </Case>
                            </Switch>
                        </DecoratedPanel>
                    </VBox>
                ))}
            </InsetPanel>
        </VBox>
    );
}

function SectionControlledBy(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetPanel>
            <Text type="secondary">Controlled by:</Text>
            <If condition={props.tile.political.value.controlledBy == null}>
                <Then>
                    <Text type="secondary">nobody</Text>
                </Then>
                <Else>
                    <DecoratedPanel
                        simpleBorder
                        paddingSmall
                        accent="blue"
                        background={
                            <DecoratedPanelColorBackground
                                color={Color.toCss(props.tile.political.value.controlledBy?.country.color!)}
                            />
                        }
                    >
                        <VBox left centerVertical gap_s>
                            <EnrichedText><Header3>{props.tile.political.value.controlledBy?.country.name}</Header3></EnrichedText>
                            <EnrichedText><ETLink
                                onClick={props.open.controllingSettlement}>{props.tile.political.value.controlledBy?.settlement.name}</ETLink></EnrichedText>
                        </VBox>
                    </DecoratedPanel>
                </Else>
            </If>
        </InsetPanel>
    );
}