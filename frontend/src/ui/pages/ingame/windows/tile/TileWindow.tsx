import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/base/tile";
import {UseTileWindow} from "./useTileWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {HeaderBanner} from "../../../../components/banner/Banner";
import {types} from "sass";
import Color = types.Color;

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
                    <Text>No tile selected</Text>
                </VBox>
            </DecoratedWindow>
        );
    } else {


        return (
            <DecoratedWindow windowId={props.windowId} withCloseButton noPadding>
                <VBox fillParent>
                    <HeaderBanner
						title={mapHiddenOrDefault(data.tile.base, "Undiscovered", base => base.terrainType.id)}
						subtitle={"Tile"}
					/>
                    <VBox scrollable fillParent gap_s stableScrollbar top stretch padding_m>

                        <WindowSection>
                            <InsetKeyValueGrid>

                                <EnrichedText>Id</EnrichedText>
                                <EnrichedText>{data.tile.identifier.id}</EnrichedText>

                                <EnrichedText>Position</EnrichedText>
                                <EnrichedText>{data.tile.identifier.q + ", " + data.tile.identifier.r}</EnrichedText>

                                <EnrichedText>Height</EnrichedText>
                                <EnrichedText>{mapHiddenOrDefault(data.tile.base, "?", base => base.height.toString())}</EnrichedText>

                                <EnrichedText>Terrain</EnrichedText>
                                <EnrichedText>{mapHiddenOrDefault(data.tile.base, "?", base => base.terrainType.id)}</EnrichedText>

                                <EnrichedText>Resource</EnrichedText>
                                <EnrichedText>{mapHiddenOrDefault(data.tile.base, "?", base => base.resourceType.id)}</EnrichedText>


                                <EnrichedText>Visibility</EnrichedText>
                                <EnrichedText>{data.tile.visibility.id}</EnrichedText>

                            </InsetKeyValueGrid>

                        </WindowSection>

                    </VBox>
                </VBox>
            </DecoratedWindow>
        );
    }

}
