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
import {VSpacer} from "../../../../components/spacer/Spacer";
import {Header2, Header3} from "../../../../components/header/Header";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Color} from "../../../../../models/base/color";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";

export interface TileWindowProps {
    windowId: string;
    identifier: TileIdentifier | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

    const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

    if (data === null) {
        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton>
                <VBox fullSize center>
                    <Text secondary>No tile selected.</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {


        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>
                <VBox fullSize>

                    <Banner
                        title={mapHiddenOrDefault(data.tile.base, "Undiscovered", base => base.terrainType.id)}
                        subtitle={"Tile"}
                        spaceAbove
                    />

                    <TabBar initial="Overview">

                        <TabOption name="Overview">
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelOverview {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Political">
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelPolitical {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="D" circle>
                            <VBox grow shrink scrollable gap_s padding_s>
                                <PanelDebug {...data}/>
                            </VBox>
                        </TabOption>

                    </TabBar>
                </VBox>
            </DecoratedWindow>
        );
    }

}


function PanelOverview(props: UseTileWindow.Data): ReactElement {
    return (
        <>
            <SectionBaseInformation {...props}/>
            <VSpacer size_s/>
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
            <InsetKeyValueGrid dontGrow dontShrink>

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
        <InsetKeyValueGrid dontGrow dontShrink>

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
        <VBox dontShrink gap_xs>

            <Header2 centered>Content</Header2>

            <Divider line/>

            <InsetPanel grow>

                {props.tile.objects.length === 0 && (
                    <VBox padding_m center>
                        <Text secondary>Nothing on this tile.</Text>
                    </VBox>
                )}

                {props.tile.objects.length > 0 && (
                    <VBox padding_s gap_s>
                        {props.tile.objects.map(tileObject => (

                            <DecoratedPanel
                                key={tileObject.settlement?.id + "/" + tileObject.worldObject?.id}
                                background={
                                    <DecoratedPanel.ColorBackground color={Color.toCss(tileObject.country.color)}/>
                                }
                                dontGrow dontShrink
                            >
                                <Switch>
                                    <Case condition={tileObject.settlement != null}>
                                        <HBox padding_s spaceBetween centerVertical>
                                            <EnrichedText><ETLink
                                                onClick={() => props.open.tileObject(tileObject)}>{tileObject.settlement?.name}</ETLink></EnrichedText>
                                            <Text type="secondary">Settlement</Text>
                                        </HBox>
                                    </Case>
                                    <Case condition={tileObject.worldObject != null}>
                                        <HBox padding_s spaceBetween centerVertical>
                                            <EnrichedText><ETLink
                                                onClick={() => props.open.tileObject(tileObject)}>{tileObject.worldObject?.type.id}</ETLink></EnrichedText>
                                            <Text type="secondary">Unit</Text>
                                        </HBox>
                                    </Case>
                                </Switch>
                            </DecoratedPanel>

                        ))}
                    </VBox>
                )}


            </InsetPanel>
        </VBox>
    );
}

function SectionControlledBy(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetPanel dontShrink>
            <VBox padding_s gap_s>

                <Text secondary>Controlled by:</Text>

                <If condition={props.tile.political.value.controlledBy == null}>
                    <Then>
                        <Text secondary center>nobody</Text>
                    </Then>
                    <Else>
                        <DecoratedPanel
                            background={
                                <DecoratedPanel.ColorBackground
                                    color={Color.toCss(props.tile.political.value.controlledBy?.country.color!)}
                                />
                            }
                        >
                            <VBox padding_m gap_xs>
                                <EnrichedText><Header3>{props.tile.political.value.controlledBy?.country.name}</Header3></EnrichedText>
                                <EnrichedText><ETLink
                                    onClick={props.open.controllingSettlement}>{props.tile.political.value.controlledBy?.settlement.name}</ETLink></EnrichedText>
                            </VBox>
                        </DecoratedPanel>
                    </Else>
                </If>

            </VBox>
        </InsetPanel>
    );
}