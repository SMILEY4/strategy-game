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
import {mapHiddenOrDefault} from "../../../../../models/hiddenType";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";

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
				title={mapHiddenOrDefault(data.tile.base, "Undiscovered", base => base.terrainType.id)}
				subtitle={"Tile"}
			>
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

					<ButtonPrimary blue disabled={!data.settlement.valid} onClick={data.settlement.found}>Found Settlement</ButtonPrimary>

				</WindowSection>
			</DefaultDecoratedWindowWithBanner>
		);
	}

}
