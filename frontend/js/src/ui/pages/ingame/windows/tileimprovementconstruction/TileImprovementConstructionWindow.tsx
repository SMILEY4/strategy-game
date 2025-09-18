import React, {ReactElement} from "react";
import {UseTileImprovementConstructionWindow} from "./useTileImprovementConstructionWindow";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Txt} from "../../../../components/text/Txt";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import {Button} from "../../../../components/button/Button";

export interface TileImprovementConstructionWindowProps {
	windowId: string;
	worldObjectId: WorldObject.Id
}

export function TileImprovementConstructionWindow(props: TileImprovementConstructionWindowProps): ReactElement {

	const data: UseTileImprovementConstructionWindow.Data = UseTileImprovementConstructionWindow.useData(props.windowId, props.worldObjectId);

	return (
		<DecoratedWindow
			windowId={props.windowId}
			withCloseButton
			style={{minHeight: "200px"}}
		>
			<VBox padding_l gap_m fullSize>

				<VBox gap_xs dontShrink dontGrow>
					<Txt.Header1>
						<Txt.String>Improvement</Txt.String>
					</Txt.Header1>
				</VBox>

				<Divider line/>

				{data.options.length === 0 && (
					<Txt.Body secondary center>
						<Txt.String>Nothing available</Txt.String>
					</Txt.Body>
				)}

				{data.options.length > 0 && (
					<InsetPanel shrink grow>
						<VBox gap_s padding_s fullSize scrollable>

							{data.options.map(entry => (
								<ConstructionListEntry
									key={entry.type}
									data={data}
									entry={entry}
								/>
							))}

						</VBox>
					</InsetPanel>
				)}

			</VBox>
		</DecoratedWindow>
	);
}

function ConstructionListEntry(props: {
	data: UseTileImprovementConstructionWindow.Data,
	entry: UseTileImprovementConstructionWindow.ConstructionOption
}): ReactElement {
	return (
		<DecoratedPanel
			dontGrow
			dontShrink
			pattern
			blue={props.entry.available}
		>
			<HBox gap_s padding_s fullSize>
				<Txt.Body grow shrink>
					<Txt.String>{props.entry.type}</Txt.String>
				</Txt.Body>
				<Button
					small
					disabled={!props.entry.available}
					onClick={() => props.data.construct(props.entry)}
				>
					Construct
				</Button>
			</HBox>
		</DecoratedPanel>
	);
}