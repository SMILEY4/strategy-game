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
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: string | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DefaultDecoratedWindow windowId={props.windowId}>
				<VBox fillParent center>
					<Text>No object selected</Text>
				</VBox>
			</DefaultDecoratedWindow>
		);
	} else {
		return (
			<DefaultDecoratedWindowWithBanner
				windowId={props.windowId}
				title={data.worldObject.type.id}
				subtitle={"World Object"}
			>
				<WindowSection>
					<InsetKeyValueGrid>

						<EnrichedText>Id</EnrichedText>
						<EnrichedText>{data.worldObject.id}</EnrichedText>

						<EnrichedText>Position</EnrichedText>
						<EnrichedText>{data.worldObject.tile.q + ", " + data.worldObject.tile.r}</EnrichedText>

					</InsetKeyValueGrid>
				</WindowSection>

				<ButtonPrimary color="blue" onClick={data.startMoveCommand}>
					Move
				</ButtonPrimary>

			</DefaultDecoratedWindowWithBanner>
		);
	}

}
