import React, {ReactElement} from "react";
import {DecoratedWindow, DefaultDecoratedWindow} from "../../../../components/windows/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Text} from "../../../../components/text/Text";
import {UseMoveWindow} from "./useWorldObjectWindow";
import {Header1} from "../../../../components/header/Header";
import {ButtonPrimary} from "../../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../../components/layout/hbox/HBox";

export interface MoveWindowProps {
	windowId: string;
	identifier: string | null;
}

export function MoveWindow(props: MoveWindowProps): ReactElement {

	const data: UseMoveWindow.Data | null = UseMoveWindow.useData(props.identifier);

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
			<DecoratedWindow
				windowId={props.windowId}
				withCloseButton={false}
				noPadding={false}
				style={{
					minWidth: "fit-content",
					minHeight: "160px",
				}}
			>
				<VBox fillParent gap_s top stretch>
					<Header1>Move Unit</Header1>
					<Text>{data.remainingPoints + "/" + data.totalPoints + "Movement Points left"}</Text>
					<HBox right gap_s>
						<ButtonPrimary color="red" onClick={data.cancel}>Cancel</ButtonPrimary>
						<ButtonPrimary color="green" onClick={data.accept}>Accept</ButtonPrimary>
					</HBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
