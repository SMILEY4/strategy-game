import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {UseTileWindow} from "./useTileWindow";
import {
    DefaultDecoratedWindow,
    DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";

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
				title={data.tile.terrainType.id}
				subtitle={"Tile"}
			>
				<WindowSection>
					<InsetKeyValueGrid>

						<EnrichedText>Id</EnrichedText>
						<EnrichedText>{data.tile.identifier.id}</EnrichedText>

						<EnrichedText>Position</EnrichedText>
						<EnrichedText>{data.tile.identifier.q + ", " + data.tile.identifier.r}</EnrichedText>

						<EnrichedText>Height</EnrichedText>
						<EnrichedText>{data.tile.height}</EnrichedText>

						<EnrichedText>Terrain</EnrichedText>
						<EnrichedText>{data.tile.terrainType.id}</EnrichedText>

						<EnrichedText>Resource</EnrichedText>
						<EnrichedText>{data.tile.resourceType.id}</EnrichedText>

					</InsetKeyValueGrid>
				</WindowSection>
			</DefaultDecoratedWindowWithBanner>
		);
	}

}
