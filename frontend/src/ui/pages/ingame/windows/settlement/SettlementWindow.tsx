import React, {ReactElement} from "react";
import {
	DefaultDecoratedWindow,
	DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {WindowSection} from "../../../../components/section/ContentSection";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {UseSettlementWindow} from "./useSettlementWindow";

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: string | null;
}

export function SettlementWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DefaultDecoratedWindow windowId={props.windowId}>
				<VBox fillParent center>
					<Text>No settlement selected</Text>
				</VBox>
			</DefaultDecoratedWindow>
		);
	} else {
		return (
			<DefaultDecoratedWindowWithBanner
				windowId={props.windowId}
				title={data.settlement.identifier.name}
				subtitle={"Settlement"}
			>

				<WindowSection>
					<InsetKeyValueGrid>

						<EnrichedText>Id</EnrichedText>
						<EnrichedText>{data.settlement.identifier.id}</EnrichedText>

						<EnrichedText>Position</EnrichedText>
						<EnrichedText>{data.settlement.tile.q + ", " + data.settlement.tile.r}</EnrichedText>

						<EnrichedText>Country</EnrichedText>
						<EnrichedText>{data.settlement.country.name}</EnrichedText>

					</InsetKeyValueGrid>
				</WindowSection>

			</DefaultDecoratedWindowWithBanner>
		);
	}

}
