import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/tile";
import {UseTileWindow} from "./useTileWindow";
import {
    DefaultDecoratedWindow,
    DefaultDecoratedWindowWithBanner,
} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";

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
				title={"Unknown"}
				subtitle={"Tile"}
			>
			</DefaultDecoratedWindowWithBanner>
		);
	}

}
