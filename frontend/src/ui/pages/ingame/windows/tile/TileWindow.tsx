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
import {Case, Switch} from "react-if";
import {TileResourceType} from "../../../../../models/base/TileResourceType";
import {Header2, Header3} from "../../../../components/header/Header";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Color} from "../../../../../models/base/color";
import {ETLink} from "../../../../components/textenriched/elements/ETLink";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Visibility} from "../../../../../models/base/visibility";
import {VSpacer} from "../../../../components/spacer/Spacer";

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
                    <Text secondary center>No tile selected.</Text>
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
                            <VBox grow shrink scrollable padding_s gap_m>
                                <PanelOverview {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="Political">
                            <VBox grow shrink scrollable padding_s gap_m>
                                <PanelPolitical {...data}/>
                            </VBox>
                        </TabOption>

                        <TabOption name="D" circle>
                            <VBox grow shrink scrollable padding_s gap_m>
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
            {!props.tile.base.visible && (
                <EnrichedText>unknown</EnrichedText>
            )}
            {props.tile.base.visible && (
                <EnrichedText>{props.tile.base.value.terrainType.id}</EnrichedText>
            )}

            <EnrichedText>Resource:</EnrichedText>
            {!props.tile.base.visible && (
                <EnrichedText>unknown</EnrichedText>
            )}
            {(props.tile.base.visible && props.tile.base.value.resourceType === TileResourceType.NONE) && (
                <EnrichedText>{props.tile.base.value.resourceType.id}</EnrichedText>
            )}
            {(props.tile.base.visible && props.tile.base.value.resourceType !== TileResourceType.NONE) && (
                <EnrichedText><ETImageIcon
                    url={props.tile.base.value.resourceType.getIconPath()}/> {props.tile.base.value.resourceType.id}
                </EnrichedText>
            )}

            <EnrichedText>Location:</EnrichedText>
            <EnrichedText>{props.tile.identifier.q + "," + props.tile.identifier.r}</EnrichedText>

        </InsetKeyValueGrid>
    );
}


function SectionContent(props: UseTileWindow.Data): ReactElement {
    return (
        <VBox dontShrink gap_xs>

            <VSpacer size_s/>
            <Header2 centered>Content</Header2>
            <Divider line/>

            {(props.tile.visibility !== Visibility.VISIBLE) && (
                <Text center secondary>Unknown</Text>
            )}

            {(props.tile.visibility === Visibility.VISIBLE && props.tile.objects.length === 0) && (
                <Text center secondary>Nothing on this tile.</Text>
            )}

            {props.tile.objects.length > 0 && (
                <InsetPanel grow>
                    <VBox padding_s gap_s fullSize>
                        {props.tile.objects.map(tileObject => (

                            <DecoratedPanel
                                key={tileObject.settlement?.id + "/" + tileObject.worldObject?.id}
                                background={
                                    <DecoratedPanel.ColorBackground color={Color.toCss(tileObject.country.color)}/>
                                }
                                blue
                                pattern
                                dontGrow
                                dontShrink
                            >
                                <Switch>
                                    <Case condition={tileObject.settlement != null}>
                                        <HBox padding_s gap_s spaceBetween centerVertical>
                                            <EnrichedText><ETLink
                                                onClick={() => props.open.tileObject(tileObject)}>{tileObject.settlement?.name}</ETLink></EnrichedText>
                                            <Text secondary>Settlement</Text>
                                        </HBox>
                                    </Case>
                                    <Case condition={tileObject.worldObject != null}>
                                        <HBox padding_s gap_s spaceBetween centerVertical>
                                            <EnrichedText><ETLink
                                                onClick={() => props.open.tileObject(tileObject)}>{tileObject.worldObject?.type.id}</ETLink></EnrichedText>
                                            <Text secondary>Unit</Text>
                                        </HBox>
                                    </Case>
                                </Switch>
                            </DecoratedPanel>

                        ))}
                    </VBox>
                </InsetPanel>
            )}
        </VBox>
    );
}

function SectionControlledBy(props: UseTileWindow.Data): ReactElement {
    return (
        <InsetPanel dontShrink>
            <VBox padding_s gap_s fullSize>

                <Text secondary>Controlled by:</Text>

                {!props.tile.political.visible && (
                    <Text secondary center>Unknown</Text>
                )}

                {(props.tile.political.visible && props.tile.political.value.controlledBy == null) && (
                    <Text secondary center>Unclaimed</Text>
                )}

                {(props.tile.political.visible && props.tile.political.value.controlledBy != null) && (
                    <DecoratedPanel
                        blue
                        pattern
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
                )}

            </VBox>
        </InsetPanel>
    );
}